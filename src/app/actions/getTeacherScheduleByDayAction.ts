"use server";

import { checkAuthAndParams } from "@/utils/authUtils";
import { GetTeacherScheduleResponse, TeacherHourlyScheduleItem } from "@/models/types/teachers";
import messages from "@/resources/messages";
import { db, schema } from "@/db";
import { and, asc, eq } from "drizzle-orm";

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
        const schedules = await db.query.annualSchedule.findMany({
            where: and(
                eq(schema.annualSchedule.teacherId, teacherId),
                eq(schema.annualSchedule.day, day),
            ),
            with: {
                class: true,
                subject: true,
            },
            orderBy: [asc(schema.annualSchedule.hour)],
        });

        if (!schedules || schedules.length === 0) {
            return {
                success: true,
                message: messages.dailySchedule.retrieveSuccess,
                data: [],
            };
        }

        const teacherSchedule = schedules.map(
            (schedule) =>
                ({
                    hour: schedule.hour,
                    class: schedule.class,
                    subject: schedule.subject,
                }) as TeacherHourlyScheduleItem,
        );

        return {
            success: true,
            message: messages.dailySchedule.retrieveSuccess,
            data: teacherSchedule,
        };
    } catch (error) {
        console.error("Error fetching teacher schedule:", error);
        return {
            success: false,
            message: messages.dailySchedule.retrieveError,
        };
    }
}
