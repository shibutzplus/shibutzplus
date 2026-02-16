"use server";

import { GetSchoolResponse } from "@/models/types/school";
import { publicAuthAndParams } from "@/utils/authUtils";
import messages from "@/resources/messages";
import { dbLog } from "@/services/loggerService";
import { getCachedSchool } from "@/services/entities/getEntitiesLists";

// TODO: public action, risk, no session check
export async function getSchoolAction(schoolId: string): Promise<GetSchoolResponse> {
    try {
        const authError = await publicAuthAndParams({ schoolId });
        if (authError) {
            return authError as GetSchoolResponse;
        }

        const school = await getCachedSchool(schoolId);

        if (!school) {
            return {
                success: false,
                message: messages.school.notFound,
            };
        }

        return {
            success: true,
            message: messages.school.success,
            data: school,
        };
    } catch (error) {
        dbLog({ description: `Error fetching school: ${error instanceof Error ? error.message : String(error)}`, schoolId });
        return {
            success: false,
            message: messages.common.serverError,
        };
    }
}
