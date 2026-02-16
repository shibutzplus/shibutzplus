"use server";

import { GetDailyScheduleResponse } from "@/models/types/dailySchedule";
import { publicAuthAndParams } from "@/utils/authUtils";
import messages from "@/resources/messages";
import { dbLog } from "@/services/loggerService";
import { getCachedDailySchedule } from "@/services/schedule/getDailySchedule";
import { getCachedSchool } from "@/services/entities/getEntitiesLists";

/**
 * Server action to fetch cached daily schedule for public schedule-full page.
 * Verifies the date is published before returning data.
 */
export async function getCachedDailyScheduleAction(
    schoolId: string,
    date: string,
): Promise<GetDailyScheduleResponse> {
    try {
        const authError = await publicAuthAndParams({ schoolId, date });
        if (authError) return authError as GetDailyScheduleResponse;

        // Verify the date is actually published
        const school = await getCachedSchool(schoolId);

        if (!school?.publishDates?.includes(date)) {
            return {
                success: false,
                message: messages.dailySchedule.notPublished,
            };
        }

        // Fetch from cache
        const dailySchedule = await getCachedDailySchedule(schoolId, date);

        return {
            success: true,
            message: messages.dailySchedule.success,
            data: dailySchedule,
        };
    } catch (error) {
        dbLog({ description: `Error fetching cached daily schedule: ${error instanceof Error ? error.message : String(error)}`, schoolId });
        return {
            success: false,
            message: messages.common.serverError,
        };
    }
}
