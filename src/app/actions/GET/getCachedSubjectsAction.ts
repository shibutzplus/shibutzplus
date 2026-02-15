"use server";

import { GetSubjectsResponse } from "@/models/types/subjects";
import { publicAuthAndParams } from "@/utils/authUtils";
import messages from "@/resources/messages";
import { dbLog } from "@/services/loggerService";
import { getCachedSubjectsList } from "@/services/entities/getEntitiesLists";
import { PortalTypeVal } from "@/models/types";

/**
 * Server action to fetch cached subjects list for public pages.
 */
export async function getCachedSubjectsAction(
    schoolId: string,
    options?: { portalType?: PortalTypeVal }
): Promise<GetSubjectsResponse> {
    try {
        const authError = await publicAuthAndParams({ schoolId });
        if (authError) return authError as GetSubjectsResponse;

        const subjects = await getCachedSubjectsList(schoolId, options);

        return {
            success: true,
            message: messages.subjects.success,
            data: subjects,
        };
    } catch (error) {
        dbLog({ description: `Error fetching cached subjects: ${error instanceof Error ? error.message : String(error)}`, schoolId });
        return {
            success: false,
            message: messages.common.serverError,
        };
    }
}
