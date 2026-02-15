"use server";

import { GetClassesResponse } from "@/models/types/classes";
import { publicAuthAndParams } from "@/utils/authUtils";
import messages from "@/resources/messages";
import { dbLog } from "@/services/loggerService";
import { getCachedClassesList } from "@/services/entities/getEntitiesLists";
import { PortalTypeVal } from "@/models/types";

/**
 * Server action to fetch cached classes list for public pages.
 */
export async function getCachedClassesAction(
    schoolId: string,
    options?: { portalType?: PortalTypeVal }
): Promise<GetClassesResponse> {
    try {
        const authError = await publicAuthAndParams({ schoolId });
        if (authError) return authError as GetClassesResponse;

        const classes = await getCachedClassesList(schoolId, options);

        return {
            success: true,
            message: messages.classes.success,
            data: classes,
        };
    } catch (error) {
        dbLog({ description: `Error fetching cached classes: ${error instanceof Error ? error.message : String(error)}`, schoolId });
        return {
            success: false,
            message: messages.common.serverError,
        };
    }
}
