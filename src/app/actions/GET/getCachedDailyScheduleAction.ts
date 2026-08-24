"use server";

import { GetDailyScheduleResponse } from "@/models/types/dailySchedule";
import { publicAuthAndParams } from "@/utils/authUtils";
import messages from "@/resources/messages";
import { dbLog } from "@/services/loggerService";
import { getSchoolAction } from "@/app/actions/GET/getSchoolAction";

/**
 * Server action to fetch cached daily schedule for school-changes and school-changes-full pages.
 * Verifies the date is published before returning data.
 */
export async function getCachedDailyScheduleAction(
    schoolId: string,
    date: string,
): Promise<GetDailyScheduleResponse> {
    try {
        const authError = await publicAuthAndParams({ schoolId, date });
        if (authError) return authError as GetDailyScheduleResponse;

        // Lior Debug
        console.log(`[Lior Debug Server] getCachedDailyScheduleAction called with schoolId=${schoolId}, date=${date}`);
        await dbLog({
            schoolId,
            description: `[Lior Debug] getCachedDailyScheduleAction called with schoolId=${schoolId}, date=${date}`,
            metadata: { schoolId, date }
        });

        // Verify the date is actually published using fresh school data
        const schoolRes = await getSchoolAction(schoolId, { forceFresh: true });
        const school = schoolRes.data;

        // Lior Debug
        console.log(`[Lior Debug Server] schoolRes.success=${schoolRes?.success}, publishDates=${JSON.stringify(school?.publishDates)}`);
        await dbLog({
            schoolId,
            description: `[Lior Debug] school check: success=${schoolRes?.success}, publishDates=${JSON.stringify(school?.publishDates)}, includesDate=${school?.publishDates?.includes(date)}`,
            metadata: { success: schoolRes?.success, publishDates: school?.publishDates, targetDate: date, includesDate: school?.publishDates?.includes(date) }
        });

        if (!schoolRes.success || !school || !school.publishDates?.includes(date)) {
            // Lior Debug
            console.log(`[Lior Debug Server] Date NOT published! Target date=${date}`);
            await dbLog({
                schoolId,
                description: `[Lior Debug] Date NOT published! Target date=${date}, publishDates=${JSON.stringify(school?.publishDates)}`,
                metadata: { targetDate: date, publishDates: school?.publishDates }
            });
            return {
                success: false,
                message: messages.dailySchedule.notPublished,
            };
        }

        const { getDailyScheduleService } = await import("@/services/schedule/getCachedDailySchedule");
        const dailySchedule = await getDailyScheduleService(schoolId, date);

        // Lior Debug
        console.log(`[Lior Debug Server] getDailyScheduleService returned ${dailySchedule?.length} rows`);
        await dbLog({
            schoolId,
            description: `[Lior Debug] getDailyScheduleService returned ${dailySchedule?.length} rows for date ${date}`,
            metadata: { rowCount: dailySchedule?.length, sample: dailySchedule?.slice(0, 3) }
        });

        return {
            success: true,
            message: messages.dailySchedule.success,
            data: dailySchedule,
        };
    } catch (error) {
        // Lior Debug
        console.error(`[Lior Debug Server] Error in getCachedDailyScheduleAction:`, error);
        dbLog({ description: `[Lior Debug Error] Error fetching cached daily schedule: ${error instanceof Error ? error.message : String(error)}`, schoolId });
        return {
            success: false,
            message: messages.common.serverError,
        };
    }
}
