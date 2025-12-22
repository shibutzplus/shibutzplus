"use server";

import { db, executeQuery, schema } from "@/db";
import { eq } from "drizzle-orm";
import { ActionResponse } from "@/models/types/actions";
import messages from "@/resources/messages";

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
        return { success: true, message: messages.publish.success }; // Or a specific unpublish message if available
    } catch (error) {
        console.error("Error unpublishing daily schedule:", error);
        return { success: false, message: messages.common.serverError };
    }
}
