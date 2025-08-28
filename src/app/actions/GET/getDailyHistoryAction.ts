"use server";

import { DailyScheduleType } from "@/models/types/dailySchedule";
import { ActionResponse } from "@/models/types/actions";
import { checkAuthAndParams } from "@/utils/authUtils";
import messages from "@/resources/messages";
import { and, eq, gte, lte } from "drizzle-orm";
import { db, schema } from "../../../db";
import { generateDateRange, getCurrentMonth, getCurrentYear, getDateReturnString } from "@/utils/time";

export type DailyHistoryMatrix = {
    [date: string]: DailyScheduleType[];
};

export type GetDailyHistoryResponse = ActionResponse & {
    data?: DailyHistoryMatrix;
};

// TODO - not in use
export async function getDailyHistoryAction(schoolId: string): Promise<GetDailyHistoryResponse> {
    try {
        const authError = await checkAuthAndParams({ schoolId });
        if (authError) {
            return authError as GetDailyHistoryResponse;
        }

        const currentYear = getCurrentYear();
        const currentMonth = getCurrentMonth();
        
        const schoolYear = currentMonth >= 8 ? currentYear : currentYear - 1;
        const startDate = new Date(`${schoolYear}-09-01`); // September 1st of school year
        const endDate = new Date();
        
        // Generate all dates in the range
        const allDates = generateDateRange(startDate, endDate);
        
        // Query database for all schedules in the date range
        const schedules = await db.query.dailySchedule.findMany({
            where: and(
                eq(schema.dailySchedule.schoolId, schoolId),
                gte(schema.dailySchedule.date, getDateReturnString(startDate)),
                lte(schema.dailySchedule.date, getDateReturnString(endDate))
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
        // Group schedules by date
        const schedulesByDate: { [date: string]: DailyScheduleType[] } = {};
        
        schedules.forEach((schedule: any) => {
            const dateKey = schedule.date;
            if (!schedulesByDate[dateKey]) {
                schedulesByDate[dateKey] = [];
            }
            
            schedulesByDate[dateKey].push({
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
                instructions: schedule.instructions,
                links: schedule.links,
                position: schedule.position,
                createdAt: schedule.createdAt,
                updatedAt: schedule.updatedAt,
            } as DailyScheduleType);
        });
        // Create ordered result by iterating through dates in chronological order
        const orderedResult: { [date: string]: DailyScheduleType[] } = {};
        allDates.forEach(date => {
            orderedResult[date] = schedulesByDate[date] || [];
        });

        return {
            success: true,
            message: messages.dailySchedule.success,
            data: orderedResult,
        };
    } catch (error) {
        console.error("Error fetching daily schedule history:", error);
        return {
            success: false,
            message: messages.common.serverError,
        };
    }
}