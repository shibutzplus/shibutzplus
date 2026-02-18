"use server";

import { db, executeQuery, schema } from "@/db";
import { eq } from "drizzle-orm";
import { ActionResponse } from "@/models/types/actions";
import messages from "@/resources/messages";
import { revalidatePath, revalidateTag } from "next/cache";
import { dbLog } from "@/services/loggerService";
import { pushSyncUpdateServer } from "@/services/sync/serverSyncService";
import { DAILY_PUBLISH_DATA_CHANGED } from "@/models/constant/sync";
import { cacheTags } from "@/lib/cacheTags";

export async function unpublishDailyScheduleAction(
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

        const publishDates = Array.isArray(school.publishDates) ? school.publishDates : [];
        if (!publishDates.includes(date)) {
            // Date not found, so technically it's "unpublished"
            return { success: true };
        }

        const updatedDates = publishDates.filter(d => d !== date);

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

        // Clear school cache and all teacher schedules for this school
        revalidateTag(cacheTags.school(schoolId));
        revalidateTag(cacheTags.schoolSchedule(schoolId));

        void pushSyncUpdateServer(DAILY_PUBLISH_DATA_CHANGED, { schoolId, date });

        return { success: true, message: messages.publish.success };
    } catch (error) {
        dbLog({
            description: `Error unpublishing daily schedule: ${error instanceof Error ? error.message : String(error)}`,
            schoolId,
            metadata: { date }
        });
        return { success: false, message: messages.common.serverError };
    }
}
