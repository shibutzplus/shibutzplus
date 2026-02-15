"use server";

import { GetTeachersResponse } from "@/models/types/teachers";
import { checkAuthAndParams, publicAuthAndParams } from "@/utils/authUtils";
import messages from "@/resources/messages";
import { dbLog } from "@/services/loggerService";
import { getCachedTeachersList } from "@/services/entities/getEntitiesLists";
import { PortalType, PortalTypeVal } from "@/models/types";

export async function getTeachersAction(
    schoolId: string,
    options: { portalType: PortalTypeVal; includeSubstitutes: boolean } = { portalType: PortalType.Manager, includeSubstitutes: true },
): Promise<GetTeachersResponse> {
    try {
        let authError;
        if (options.portalType === PortalType.Manager) {
            authError = await checkAuthAndParams({ schoolId });
        } else {
            authError = await publicAuthAndParams({ schoolId });
        }
        if (authError) return authError as GetTeachersResponse;

        const teachers = await getCachedTeachersList(schoolId, options);

        if (!teachers || teachers.length === 0) {
            return { success: true, message: messages.teachers.success, data: [] };
        }

        return { success: true, message: messages.teachers.success, data: teachers };
    } catch (error) {
        dbLog({ description: `Error fetching all teachers: ${error instanceof Error ? error.message : String(error)}`, schoolId });
        return { success: false, message: messages.common.serverError };
    }
}
