"use server";

import { ActionResponse } from "@/models/types/actions";
import { DailyScheduleType } from "@/models/types/dailySchedule";
import { checkAuthAndParams } from "@/utils/authUtils";
import messages from "@/resources/messages";
import { db, schema } from "@/db";
import { and, eq } from "drizzle-orm";

export async function deleteDailyColumnAction(
    schoolId: string,
    columnId: string,
): Promise<ActionResponse & { dailySchedules?: DailyScheduleType[] }> {
    try {
        const authError = await checkAuthAndParams({ schoolId, columnId });
        if (authError) {
            return authError as ActionResponse;
        }

        // Delete all daily schedule entries for this column
        await db
            .delete(schema.dailySchedule)
            .where(
                and(
                    eq(schema.dailySchedule.schoolId, schoolId),
                    eq(schema.dailySchedule.columnId, columnId),
                ),
            );

        // Get the remaining daily schedules for this school
        const schedules = await db.query.dailySchedule.findMany({
            where: eq(schema.dailySchedule.schoolId, schoolId),
            with: {
                school: true,
                class: true,
                subject: true,
                absentTeacher: true,
                presentTeacher: true,
                subTeacher: true,
            },
        });

        // Map the schedules to the expected format
        const dailySchedules = schedules.map((schedule) => ({
            id: schedule.id,
            date: new Date(schedule.date),
            day: schedule.day,
            hour: schedule.hour,
            columnId: schedule.columnId,
            school: schedule.school,
            class: schedule.class,
            subject: schedule.subject,
            absentTeacher: schedule.absentTeacher,
            presentTeacher: schedule.presentTeacher,
            subTeacher: schedule.subTeacher,
            createdAt: schedule.createdAt,
            updatedAt: schedule.updatedAt,
        } as DailyScheduleType));

        return {
            success: true,
            message: messages.dailySchedule.deleteSuccess,
            dailySchedules,
        };
    } catch (error) {
        console.error("Error deleting daily schedule column:", error);
        return {
            success: false,
            message: messages.dailySchedule.deleteError,
        };
    }
}
