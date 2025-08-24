"use server";

import { ActionResponse } from "@/models/types/actions";
import { AnnualScheduleType } from "@/models/types/annualSchedule";
import { checkAuthAndParams } from "@/utils/authUtils";
import messages from "@/resources/messages";
import { db, schema } from "@/db";
import { eq } from "drizzle-orm";

export async function deleteAnnualScheduleAction(
    id: string,
    schoolId: string
): Promise<ActionResponse & { deleted?: AnnualScheduleType }> {
    try {
        const authError = await checkAuthAndParams({ id, schoolId });
        if (authError) {
            return authError as ActionResponse;
        }

        // Fetch the row to return after deletion
        const toDelete = await db.query.annualSchedule.findFirst({
            where: eq(schema.annualSchedule.id, id),
            with: {
                school: true,
                class: true,
                teacher: true,
                subject: true,
            },
        });

        if (!toDelete) {
            return {
                success: false,
                message: "Annual schedule entry not found.",
            };
        }

        await db.delete(schema.annualSchedule).where(eq(schema.annualSchedule.id, id));

        const deleted: AnnualScheduleType = {
            id: toDelete.id,
            day: toDelete.day,
            hour: toDelete.hour,
            school: toDelete.school,
            class: toDelete.class,
            teacher: toDelete.teacher,
            subject: toDelete.subject,
            createdAt: toDelete.createdAt,
            updatedAt: toDelete.updatedAt,
        };

        return {
            success: true,
            message: messages.annualSchedule.deleteSuccess,
            deleted,
        };
    } catch (error) {
        console.error("Error deleting annual schedule entry:", error);
        return {
            success: false,
            message: messages.annualSchedule.deleteError,
        };
    }
}
