"use server";

import { GetClassesResponse } from "@/models/types/classes";
import { checkAuthAndParams, publicAuthAndParams } from "@/utils/authUtils";
import messages from "@/resources/messages";
import { dbLog } from "@/services/loggerService";
import { getCachedClassesList } from "@/services/entities/getEntitiesLists";
import { PortalType, PortalTypeVal } from "@/models/types";

export async function getClassesAction(
    schoolId: string,
    options: { portalType: PortalTypeVal } = { portalType: PortalType.Manager },
): Promise<GetClassesResponse> {
    try {
        let authError;
        if (options.portalType === PortalType.Manager) {
            authError = await checkAuthAndParams({ schoolId });
        } else {
            authError = await publicAuthAndParams({ schoolId });
        }

        if (authError) {
            return authError as GetClassesResponse;
        }

        const classes = await getCachedClassesList(schoolId);

        if (!classes || classes.length === 0) {
            return {
                success: true,
                message: messages.classes.success,
                data: [],
            };
        }

        return {
            success: true,
            message: messages.classes.success,
            data: classes,
        };
    } catch (error) {
        dbLog({ description: `Error fetching classes: ${error instanceof Error ? error.message : String(error)}`, schoolId });
        return {
            success: false,
            message: messages.common.serverError,
        };
    }
}
