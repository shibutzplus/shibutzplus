"use server";

import { dbLog } from "@/services/loggerService";
import { GetDailyScheduleResponse } from "@/models/types/dailySchedule";
import messages from "@/resources/messages";
import { getCachedTeacherHistorySchedule } from "@/services/history/getCachedHistory";

export async function getTeacherHistoryScheduleAction(
    teacherName: string,
    schoolId: string,
    date: string
): Promise<GetDailyScheduleResponse> {
    try {
        const dailyScheduleData = await getCachedTeacherHistorySchedule(schoolId, date, teacherName);

        if (!dailyScheduleData || dailyScheduleData.length === 0) {
            return {
                success: true,
                message: "No records found.",
                data: []
            };
        }

        return {
            success: true,
            message: messages.dailySchedule.success,
            data: dailyScheduleData // The service already sorts it if needed, or we can trust the order
        };

    } catch (error) {
        dbLog({ description: `Error fetching teacher history schedule: ${error instanceof Error ? error.message : String(error)}`, schoolId });
        return {
            success: false,
            message: "Failed to fetch history.",
            data: []
        };
    }
}
