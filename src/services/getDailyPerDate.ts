"use server";

import { getDailyScheduleAction } from "@/app/actions/GET/getDailyScheduleAction";
import { DailyScheduleType, GetDailyScheduleResponse } from "@/models/types/dailySchedule";
import { getTodayDateString } from "@/utils/time";

/**
 * Fetch daily schedule for a specific date
 * @param schoolId - The school ID
 * @param date - Date in YYYY-MM-DD format
 * @returns Promise with daily schedule response
 */
export async function getDailyScheduleForDate(
    schoolId: string, 
    date: string
): Promise<GetDailyScheduleResponse> {
    return await getDailyScheduleAction(schoolId, date);
}

/**
 * Fetch daily schedule for today's date
 * @param schoolId - The school ID
 * @returns Promise with daily schedule response
 */
export async function getDailyScheduleForToday(
    schoolId: string
): Promise<GetDailyScheduleResponse> {
    const todayDate = getTodayDateString();
    return await getDailyScheduleAction(schoolId, todayDate);
}

/**
 * Client-side wrapper for fetching daily schedule data
 * This function can be called from client components and hooks
 */
export async function fetchDailyScheduleData(
    schoolId: string,
    date?: string
): Promise<{
    success: boolean;
    data?: DailyScheduleType[];
    message?: string;
}> {
    try {
        const targetDate = date || getTodayDateString();
        const response = await getDailyScheduleForDate(schoolId, targetDate);
        
        return {
            success: response.success,
            data: response.data,
            message: response.message
        };
    } catch (error) {
        console.error("Error in fetchDailyScheduleData:", error);
        return {
            success: false,
            message: "Failed to fetch daily schedule data"
        };
    }
}