"use server";

import { checkAuthAndParams } from "@/utils/authUtils";
import messages from "@/resources/messages";
import { db, schema, executeQuery } from "@/db";
import { and, asc, eq } from "drizzle-orm";
import {
    ColumnTypeValues,
    GetTeacherScheduleResponse,
    TeacherHourlyScheduleItem,
} from "@/models/types/dailySchedule";

export async function getTeacherScheduleByDayAction(
    schoolId: string,
    day: number,
    teacherId: string,
): Promise<GetTeacherScheduleResponse> {
    try {
        const authError = await checkAuthAndParams({ schoolId, day, teacherId });
        if (authError) {
            return authError as GetTeacherScheduleResponse;
        }
        const teacherSchedule = await executeQuery(async () => {
            const schedules = await db.query.annualSchedule.findMany({
                where: and(
                    eq(schema.annualSchedule.teacherId, teacherId),
                    eq(schema.annualSchedule.day, day),
                ),
                with: {
                    class: true,
                    subject: true,
                    teacher: true,
                },
                orderBy: [asc(schema.annualSchedule.hour)],
            });

            if (!schedules || schedules.length === 0) {
                return [];
            }

            const groupedSchedules = schedules.reduce<
                Record<number, TeacherHourlyScheduleItem>
            >((acc, schedule) => {
                const hour = schedule.hour;
                if (!acc[hour]) {
                    acc[hour] = {
                        hour: schedule.hour,
                        classes: [],
                        subject: schedule.subject,
                        headerCol: {
                            headerTeacher: schedule.teacher,
                            type: ColumnTypeValues.existingTeacher,
                        },
                    };
                }

                if (schedule.class) {
                     const classExists = acc[hour].classes.some(c => c.id === schedule.class.id);
                     if (!classExists) {
                         acc[hour].classes.push(schedule.class);
                     }
                }

                return acc;
            }, {});

            return Object.values(groupedSchedules).sort((a, b) => a.hour - b.hour);
        });

        if (!teacherSchedule || teacherSchedule.length === 0) {
            return {
                success: true,
                message: messages.dailySchedule.success,
                data: [],
            };
        }

        return {
            success: true,
            message: messages.dailySchedule.success,
            data: teacherSchedule,
        };
    } catch (error) {
        console.error("Error fetching teacher schedule:", error);
        return {
            success: false,
            message: messages.common.serverError,
        };
    }
}
