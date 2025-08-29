"use server";

import { DailyScheduleType, GetDailyScheduleResponse } from "@/models/types/dailySchedule";
import { checkAuthAndParams } from "@/utils/authUtils";
import messages from "@/resources/messages";
import { and, eq } from "drizzle-orm";
import { db, schema, executeQuery } from "@/db";

export async function getSubstituteTeachersAction(
    teacherId: string,
    date: string
): Promise<GetDailyScheduleResponse> {
    try {
        const authError = await checkAuthAndParams({ teacherId, date });
        if (authError) {
            return authError as GetDailyScheduleResponse;
        }

        const dailySchedule = await executeQuery(async () => {
            const schedules = await db.query.dailySchedule.findMany({
                where: and(
                    eq(schema.dailySchedule.date, date),
                    eq(schema.dailySchedule.issueTeacherId, teacherId)
                ),
                with: {
                    class: true,
                    subject: true,
                    issueTeacher: true,
                    subTeacher: true,
                },
                orderBy: schema.dailySchedule.hour,
            });

            return schedules.map(
                (schedule: any) =>
                    ({
                        id: schedule.id,
                        date: schedule.date,
                        day: schedule.day,
                        hour: schedule.hour,
                        columnId: schedule.columnId,
                        eventTitle: schedule.eventTitle,
                        event: schedule.event,
                        school: schedule.school,
                        class: schedule.class,
                        subject: schedule.subject,
                        issueTeacher: schedule.issueTeacher,
                        issueTeacherType: schedule.issueTeacherType,
                        subTeacher: schedule.subTeacher,
                        createdAt: schedule.createdAt,
                        updatedAt: schedule.updatedAt,
                    }) as DailyScheduleType,
            );
        });

        return {
            success: true,
            message: messages.dailySchedule.success,
            data: dailySchedule,
        };
    } catch (error) {
        console.error("Error fetching substitute teachers:", error);
        return {
            success: false,
            message: messages.common.serverError,
        };
    }
}
