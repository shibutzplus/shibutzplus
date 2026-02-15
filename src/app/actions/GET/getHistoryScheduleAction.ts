"use server";

import { dbLog } from "@/services/loggerService";
import { DailyScheduleType } from "@/models/types/dailySchedule";
import { ActionResponse } from "@/models/types/actions";
import { getCachedHistorySchedule } from "@/services/history/getCachedHistory";

interface GetHistoryScheduleResponse extends ActionResponse {
    data?: DailyScheduleType[];
}

export async function getHistoryScheduleAction(schoolId: string, date: string): Promise<GetHistoryScheduleResponse> {
    try {
        const dailyScheduleData = await getCachedHistorySchedule(schoolId, date);

        if (!dailyScheduleData || dailyScheduleData.length === 0) {
            return {
                success: true,
                message: "No records found.",
                data: []
            };
        }

        return {
            success: true,
            message: "History fetched successfully.",
            data: dailyScheduleData
        };

    } catch (error) {
        dbLog({ description: `Error fetching history schedule: ${error instanceof Error ? error.message : String(error)}`, schoolId });
        return {
            success: false,
            message: "Failed to fetch history.",
            data: []
        };
    }
}
