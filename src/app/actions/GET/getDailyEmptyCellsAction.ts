"use server";

import { checkAuthAndParams } from "@/utils/authUtils";
import messages from "@/resources/messages";
import { db, schema, executeQuery } from "@/db";
import { and, asc, eq, inArray } from "drizzle-orm";
import { DailyScheduleCell } from "@/models/types/dailySchedule";
import { ActionResponse } from "@/models/types/actions";

export type GetDailyEmptyCellsResponse = ActionResponse & {
    data?: DailyScheduleCell[];
};

export async function getDailyEmptyCellsAction(
    schoolId: string,
    day: number,
    existing: { teacherId: string; hours: number[] }[],
): Promise<GetDailyEmptyCellsResponse> {
    try {
        const authError = await checkAuthAndParams({ schoolId, day });
        if (authError) {
            return authError as GetDailyEmptyCellsResponse;
        }

        // Extract all teacher IDs from the existing array
        const teacherIds = existing.map(item => item.teacherId);
        
        if (teacherIds.length === 0) {
            return {
                success: true,
                message: messages.dailySchedule.success,
                data: [],
            };
        }

        // Get all schedules for these teachers on the specified day
        const emptyCells = await executeQuery(async () => {
            const schedules = await db.query.annualSchedule.findMany({
                where: and(
                    inArray(schema.annualSchedule.teacherId, teacherIds),
                    eq(schema.annualSchedule.day, day),
                ),
                with: {
                    class: true,
                    subject: true,
                    teacher: true,
                },
                orderBy: [asc(schema.annualSchedule.teacherId), asc(schema.annualSchedule.hour)],
            });

            if (!schedules || schedules.length === 0) {
                return [];
            }

            // Create a map of occupied hours for each teacher
            const occupiedHoursMap = new Map<string, Set<number>>();
            existing.forEach(item => {
                occupiedHoursMap.set(item.teacherId, new Set(item.hours));
            });

            // Filter out the occupied hours and convert to DailyScheduleCell
            return schedules
                .filter(schedule => {
                    const occupiedHours = occupiedHoursMap.get(schedule.teacherId);
                    return !occupiedHours?.has(schedule.hour);
                })
                .map(schedule => ({
                    hour: schedule.hour,
                    class: schedule.class,
                    subject: schedule.subject,
                    headerCol: { 
                        headerTeacher: schedule.teacher,
                        type: "existingTeacher" as const
                    },
                }));
        });

        return {
            success: true,
            message: messages.dailySchedule.success,
            data: emptyCells,
        };
    } catch (error) {
        console.error("Error fetching empty daily schedule cells:", error);
        return {
            success: false,
            message: messages.common.serverError,
        };
    }
}