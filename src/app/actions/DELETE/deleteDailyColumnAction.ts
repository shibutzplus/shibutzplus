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
    date: string,
): Promise<ActionResponse & { dailySchedules?: DailyScheduleType[] }> {
    try {
        const authError = await checkAuthAndParams({ schoolId, columnId, date });
        if (authError) {
            return authError as ActionResponse;
        }

        await db
            .delete(schema.dailySchedule)
            .where(
                and(
                    eq(schema.dailySchedule.schoolId, schoolId),
                    eq(schema.dailySchedule.columnId, columnId),
                ),
            );

        const schedules = await db.query.dailySchedule.findMany({
            where: and(
                eq(schema.dailySchedule.schoolId, schoolId),
                eq(schema.dailySchedule.date, date)
            ),
            with: {
                school: true,
                class: true,
                subject: true,
                absentTeacher: true,
                presentTeacher: true,
                subTeacher: true,
            },
        });

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
            position: schedule.position,
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
