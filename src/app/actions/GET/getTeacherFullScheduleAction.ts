"use server";

import { GetDailyScheduleResponse } from "@/models/types/dailySchedule";
import { publicAuthAndParams } from "@/utils/authUtils";
import messages from "@/resources/messages";
import { executeQuery } from "../../../db";
import { dbLog } from "@/services/loggerService";
import { getTeacherScheduleService } from "@/services/schedule/getTeacherSchedule";

const getTeacherFullScheduleAction = async (
    teacherId: string,
    date: string,
): Promise<GetDailyScheduleResponse> => {
    try {
        const authError = await publicAuthAndParams({ teacherId, date });
        if (authError) {
            return authError as GetDailyScheduleResponse;
        }

        const result = await executeQuery(async () => {
            return await getTeacherScheduleService(teacherId, date);
        });

        return {
            success: true,
            message: messages.dailySchedule.success,
            data: result,
        };
    } catch (error) {
        dbLog({
            description: `Error fetching teacher full schedule: ${error instanceof Error ? error.message : String(error)}`,
            user: teacherId,
            metadata: { date }
        });
        return {
            success: false,
            message: messages.common.serverError,
        };
    }
};

export default getTeacherFullScheduleAction;
