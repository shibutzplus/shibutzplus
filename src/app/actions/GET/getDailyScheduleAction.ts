"use server";

import { DailyScheduleType, GetDailyScheduleResponse } from "@/models/types/dailySchedule";
import { checkAuthAndParams } from "@/utils/authUtils";
import messages from "@/resources/messages";
import { and, between, eq, inArray } from "drizzle-orm";
import { db, schema } from "../../db";
import { getDateReturnString } from "@/utils/time";

export async function getDailyScheduleAction(schoolId: string): Promise<GetDailyScheduleResponse> {
    try {
        const authError = await checkAuthAndParams({ schoolId });
        if (authError) {
            return authError as GetDailyScheduleResponse;
        }

        // Calculate the start and end of the current week (Sunday to Friday)
        const today = new Date();
        const currentDay = today.getDay(); // 0 = Sunday, 6 = Saturday
        
        // Calculate the start of the week (Sunday)
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - currentDay); // Go back to Sunday
        
        // Calculate the end of the week (Friday)
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 5); // Go forward to Friday (5 days from Sunday)
        
        // Format dates for database query
        const startDateStr = getDateReturnString(startOfWeek);
        const endDateStr = getDateReturnString(endOfWeek);
        
        // Get days 1-6 (Sunday to Friday)
        const weekDays = ['1', '2', '3', '4', '5', '6'];
        
        const schedules = await db.query.dailySchedule.findMany({
            where: and(
                eq(schema.dailySchedule.schoolId, schoolId),
                between(schema.dailySchedule.date, startDateStr, endDateStr),
                inArray(schema.dailySchedule.day, weekDays)
            ),
            with: {
                class: true,
                subject: true,
                absentTeacher: true,
                presentTeacher: true,
                subTeacher: true,
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
