"use server";

import { DailyScheduleType, GetDailyScheduleResponse } from "@/models/types/dailySchedule";
import { publicAuthAndParams } from "@/utils/authUtils";
import messages from "@/resources/messages";
import { and, eq } from "drizzle-orm";
import { db, schema, executeQuery } from "../../../db";

export async function getDailyByTeacherAction(
    teacherId: string,
    date: string,
): Promise<GetDailyScheduleResponse> {
    try {
        const authError = await publicAuthAndParams({ teacherId, date });
        if (authError) {
            return authError as GetDailyScheduleResponse;
        }

        const dailySchedule = await executeQuery(async () => {
            const schedules = await db.query.dailySchedule.findMany({
                where: and(
                    eq(schema.dailySchedule.date, date),
                    eq(schema.dailySchedule.issueTeacherId, teacherId),
                ),
                with: {
                    class: true,
                    subject: true,
                    issueTeacher: true,
                    subTeacher: true,
                    school: true,
                },
            });

            if (!schedules) {
                return [];
            }

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
                        instructions: schedule.instructions,
                        createdAt: schedule.createdAt,
                        updatedAt: schedule.updatedAt,
                    }) as DailyScheduleType,
            );
        });

        if (!dailySchedule || dailySchedule.length === 0) {
            return {
                success: false,
                message: messages.dailySchedule.noScheduleFound,
            };
        }

        return {
            success: true,
            message: messages.dailySchedule.success,
            data: dailySchedule,
        };
    } catch (error) {
        console.error("Error fetching daily schedule by teacher:", error);
        return {
            success: false,
            message: messages.common.serverError,
        };
    }
}
