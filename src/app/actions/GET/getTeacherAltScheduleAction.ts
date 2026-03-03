"use server";

import { GetDailyScheduleResponse } from "@/models/types/dailySchedule";
import { publicAuthAndParams } from "@/utils/authUtils";
import messages from "@/resources/messages";
import { executeQuery } from "@/db";
import { dbLog } from "@/services/loggerService";
import { getCachedTeacherAltSchedule } from "@/services/schedule/getTeacherAltSchedule";

export const getTeacherAltScheduleAction = async (
    teacherId: string,
    date: string,
    schoolId: string,
): Promise<GetDailyScheduleResponse> => {
    try {
        const authError = await publicAuthAndParams({ teacherId, date });
        if (authError) {
            return authError as GetDailyScheduleResponse;
        }

        const result = await executeQuery(async () => {
            return await getCachedTeacherAltSchedule(schoolId, teacherId, date);
        });

        return {
            success: true,
            message: messages.dailySchedule.success,
            data: result,
        };
    } catch (error) {
        dbLog({
            description: `Error fetching teacher alt schedule: ${error instanceof Error ? error.message : String(error)}`,
            user: teacherId,
            schoolId,
            metadata: { date }
        });
        return {
            success: false,
            message: messages.common.serverError,
        };
    }
};
