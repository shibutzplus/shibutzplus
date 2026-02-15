"use server";
import "server-only";
import { GetAnnualScheduleResponse } from "@/models/types/annualSchedule";
import { checkAuthAndParams } from "@/utils/authUtils";
import messages from "@/resources/messages";
import { dbLog } from "@/services/loggerService";
import { getCachedAnnualSchedule } from "@/services/schedule/getAnnualSchedule";

export async function getAnnualScheduleAction(
    schoolId: string,
): Promise<GetAnnualScheduleResponse> {
    try {
        const authError = await checkAuthAndParams({ schoolId });
        if (authError) {
            return authError as GetAnnualScheduleResponse;
        }

        const annualSchedule = await getCachedAnnualSchedule(schoolId);

        return {
            success: true,
            message: messages.annualSchedule.success,
            data: annualSchedule,
        };
    } catch (error) {
        dbLog({ description: `Error fetching annual schedule: ${error instanceof Error ? error.message : String(error)}`, schoolId });
        return {
            success: false,
            message: messages.common.serverError,
        };
    }
}
