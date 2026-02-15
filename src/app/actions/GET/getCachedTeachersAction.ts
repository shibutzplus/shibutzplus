"use server";

import { GetTeachersResponse } from "@/models/types/teachers";
import { publicAuthAndParams } from "@/utils/authUtils";
import messages from "@/resources/messages";
import { dbLog } from "@/services/loggerService";
import { getCachedTeachersList } from "@/services/entities/getEntitiesLists";
import { PortalTypeVal } from "@/models/types";

/**
 * Server action to fetch cached teachers list for public pages.
 */
export async function getCachedTeachersAction(
    schoolId: string,
    options?: { portalType?: PortalTypeVal; includeSubstitutes?: boolean }
): Promise<GetTeachersResponse> {
    try {
        const authError = await publicAuthAndParams({ schoolId });
        if (authError) return authError as GetTeachersResponse;

        const teachers = await getCachedTeachersList(schoolId, options);

        return {
            success: true,
            message: messages.teachers.success,
            data: teachers,
        };
    } catch (error) {
        dbLog({ description: `Error fetching cached teachers: ${error instanceof Error ? error.message : String(error)}`, schoolId });
        return {
            success: false,
            message: messages.common.serverError,
        };
    }
}
