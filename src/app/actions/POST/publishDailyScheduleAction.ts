"use server";

import { db, executeQuery, schema } from "@/db";
import { eq } from "drizzle-orm";
import { ActionResponse } from "@/models/types/actions";
import messages from "@/resources/messages";

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
            // Wont show to the user
            return { success: true, message: messages.publish.alreadyPublished };
        }

        // queue (FIFO) maintain maximum 6 elements
        let updatedDates = [...publishDates, date];
        if (updatedDates.length > 6) {
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
        return { success: true, message: messages.publish.success };
    } catch (error) {
        console.error("Error publishing daily schedule:", error);
        return { success: false, message: messages.common.serverError };
    }
}
