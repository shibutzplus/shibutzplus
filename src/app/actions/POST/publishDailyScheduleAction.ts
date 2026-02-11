"use server";

import { db, executeQuery, schema } from "@/db";
import { eq } from "drizzle-orm";
import { ActionResponse } from "@/models/types/actions";
import messages from "@/resources/messages";
import { revalidatePath } from "next/cache";
import { dbLog } from "@/services/loggerService";
import { sendNotificationToSchool } from "@/services/pushNotifications";
import { pushSyncUpdateServer } from "@/services/sync/serverSyncService";
import { DAILY_PUBLISH_DATA_CHANGED } from "@/models/constant/sync";
import { PublishLimitNumber } from "@/models/constant/daily";

export async function publishDailyScheduleAction(
    schoolId: string,
    date: string,
): Promise<ActionResponse> {
    try {
        const school = await executeQuery(async () => {
            return (
                await db.select().from(schema.schools).where(eq(schema.schools.id, schoolId))
            )[0];
        });
        if (!school) {
            return { success: false, message: messages.school.notFound };
        }
        // Don't add duplicate dates
        const publishDates = Array.isArray(school.publishDates) ? school.publishDates : [];
        if (publishDates.includes(date)) {
            dbLog({ description: "Error publishing daily schedule: Date already published", schoolId, metadata: { date } });
            return { success: true };
        }

        // queue (FIFO) maintain maximum 6 elements
        let updatedDates = [...publishDates, date];
        if (updatedDates.length > PublishLimitNumber) {
            updatedDates = updatedDates.slice(1);
        }
        await executeQuery(async () => {
            return (
                await db
                    .update(schema.schools)
                    .set({ publishDates: updatedDates })
                    .where(eq(schema.schools.id, schoolId))
                    .returning()
            )[0];
        });

        revalidatePath("/(public)/schedule-view", "page");
        revalidatePath("/(public)/schedule-full", "page");
        revalidatePath(`/(public)/teacher-material/${schoolId}`, "page");

        // Update all users clients with new schedule (Upstash)
        void pushSyncUpdateServer(DAILY_PUBLISH_DATA_CHANGED, { schoolId, date });

        // Trigger Web Push Notification
        void sendNotificationToSchool(schoolId, {
            title: "שיבוץ פלוס",
            body: `מערכת השעות פורסמה`,
            url: `/teacher-material/${schoolId}`
        });

        return { success: true, message: messages.publish.success };
    } catch (error) {
        dbLog({ description: `Error publishing daily schedule: ${error instanceof Error ? error.message : String(error)}`, schoolId });
        return { success: false, message: messages.common.serverError };
    }
}
