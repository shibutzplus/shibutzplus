"use server";

import { checkAuthAndParams } from "@/utils/authUtils";
import messages from "@/resources/messages";
import { db, schema, executeQuery } from "@/db";
import { and, asc, eq } from "drizzle-orm";
import { ColumnTypeValues, GetTeacherScheduleResponse, TeacherHourlyScheduleItem, } from "@/models/types/dailySchedule";

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

            // Group by hour
            const schedulesByHour: Record<number, any[]> = {};
            schedules.forEach(schedule => {
                const hour = schedule.hour;
                if (!schedulesByHour[hour]) {
                    schedulesByHour[hour] = [];
                }
                schedulesByHour[hour].push(schedule);
            });

            return Object.entries(schedulesByHour).map(([hourStr, hourSchedules]) => {
                const hour = parseInt(hourStr);
                const first = hourSchedules[0];
                const classes = hourSchedules.map(s => s.class).filter(Boolean);
                
                return {
                    hour: hour,
                    classes: classes,
                    subject: first.subject,
                    // TODO: is it good? need to check
                    headerCol: {
                        headerTeacher: first.teacher,
                        type: ColumnTypeValues.existingTeacher,
                    },
                } as TeacherHourlyScheduleItem;
            });
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
