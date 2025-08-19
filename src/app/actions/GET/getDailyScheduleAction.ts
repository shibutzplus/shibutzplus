"use server";

import { DailyScheduleType, GetDailyScheduleResponse } from "@/models/types/dailySchedule";
import { checkAuthAndParams } from "@/utils/authUtils";
import messages from "@/resources/messages";
import { and, eq } from "drizzle-orm";
import { db, schema } from "../../../db";

export async function getDailyScheduleAction(schoolId: string, date: string): Promise<GetDailyScheduleResponse> {
    try {
        const authError = await checkAuthAndParams({ schoolId, date });
        if (authError) {
            return authError as GetDailyScheduleResponse;
        }


        const schedules = await db.query.dailySchedule.findMany({
            where: and(
                eq(schema.dailySchedule.schoolId, schoolId),
                eq(schema.dailySchedule.date, date)
            ),
            with: {
                class: true,
                subject: true,
                absentTeacher: true,
                presentTeacher: true,
                subTeacher: true,
                school: true,
            },
        });

        const dailySchedule = schedules.map(
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
                    absentTeacher: schedule.absentTeacher,
                    presentTeacher: schedule.presentTeacher,
                    subTeacher: schedule.subTeacher,
                    createdAt: schedule.createdAt,
                    updatedAt: schedule.updatedAt,
                }) as DailyScheduleType,
        );

        return {
            success: true,
            message: messages.dailySchedule.retrieveSuccess,
            data: dailySchedule,
        };
    } catch (error) {
        console.error("Error fetching daily schedule:", error);
        return {
            success: false,
            message: messages.dailySchedule.retrieveError,
        };
    }
}
