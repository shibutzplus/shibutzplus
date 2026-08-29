"use server";

import { db, executeQuery, schema } from "@/db";
import { eq } from "drizzle-orm";
import { ActionResponse } from "@/models/types/actions";
import messages from "@/resources/messages";
import { revalidatePath, revalidateTag } from "next/cache";
import { dbLog } from "@/services/loggerService";
import { sendPublishNotification } from "@/services/pushNotifications";
import { pushSyncUpdateServer } from "@/services/sync/serverSyncService";
import { DAILY_PUBLISH_DATA_CHANGED } from "@/models/constant/sync";
import { cacheTags } from "@/lib/cacheTags";
import { getTodayDateString } from "@/utils/time";

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
            return { success: true };
        }

        // Keep all future/current dates and clean up historical past dates
        const todayStr = getTodayDateString();
        const allDates = Array.from(new Set([...publishDates, date]));
        const updatedDates = allDates
            .filter((d) => d >= todayStr || d === date)
            .sort();
        await executeQuery(async () => {
            return (
                await db
                    .update(schema.schools)
                    .set({ publishDates: updatedDates })
                    .where(eq(schema.schools.id, schoolId))
                    .returning()
            )[0];
        });

        revalidatePath("/(public)/school-changes", "page");
        revalidatePath("/(public)/school-changes-full", "page");
        revalidatePath(`/(public)/teacher-changes/${schoolId}`, "page");

        // Clear school cache and all teacher schedules for this school
        revalidateTag(cacheTags.school(schoolId));
        revalidateTag(cacheTags.schoolSchedule(schoolId));

        // Update all users clients with new schedule (Upstash)
        void pushSyncUpdateServer(DAILY_PUBLISH_DATA_CHANGED, { schoolId, date });

        // Trigger Web Push Notification (non-blocking for publish success)
        try {
            await sendPublishNotification(schoolId, {
                title: "שיבוץ פלוס",
                body: `המערכת פורסמה`,
                url: `/teacher-changes/${schoolId}`
            }, date);
        } catch (pushErr) {
            void dbLog({
                description: `Push notification error in publishDailyScheduleAction: ${pushErr instanceof Error ? pushErr.message : String(pushErr)}`,
                schoolId,
                metadata: { date }
            });
        }

        return { success: true, message: messages.publish.success };
    } catch (error) {
        dbLog({ description: `Error publishing daily schedule: ${error instanceof Error ? error.message : String(error)}`, schoolId });
        return { success: false, message: messages.common.serverError };
    }
}
