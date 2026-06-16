"use server";

import { GetTeachersResponse } from "@/models/types/teachers";
import { GetSubjectsResponse } from "@/models/types/subjects";
import { GetClassesResponse } from "@/models/types/classes";
import { GetSchoolResponse } from "@/models/types/school";
import { publicAuthAndParams } from "@/utils/authUtils";
import messages from "@/resources/messages";
import { dbLog } from "@/services/loggerService";
import {
    getCachedTeachersList,
    getCachedSubjectsList,
    getCachedClassesList,
    getCachedSchool
} from "@/services/entities/getEntitiesLists";
import { PortalType, PortalTypeVal } from "@/models/types";

export interface PublishedPortalData {
    teachers: GetTeachersResponse["data"];
    subjects: GetSubjectsResponse["data"];
    classes: GetClassesResponse["data"];
    school: GetSchoolResponse["data"];
}

export interface PublishedPortalDataResponse {
    success: boolean;
    message: string;
    data?: PublishedPortalData;
}

/**
 * Server action to fetch all cached portal data (teachers, subjects, classes, school) in a single request.
 * Prevents concurrent server action execution issues on the client.
 */
export async function getPublishedPortalDataAction(
    schoolId: string,
    options?: { portalType?: PortalTypeVal }
): Promise<PublishedPortalDataResponse> {
    try {
        const authError = await publicAuthAndParams({ schoolId });
        if (authError) {
            return {
                success: false,
                message: authError.message || messages.auth.unauthorized,
            };
        }

        const effectivePortalType = options?.portalType || PortalType.Teacher;

        // Fetch all cached lists in parallel on the server
        const [teachers, subjects, classes, school] = await Promise.all([
            getCachedTeachersList(schoolId, { portalType: effectivePortalType, includeSubstitutes: true }),
            getCachedSubjectsList(schoolId, { portalType: effectivePortalType }),
            getCachedClassesList(schoolId, { portalType: effectivePortalType }),
            getCachedSchool(schoolId),
        ]);

        if (!school) {
            return {
                success: false,
                message: messages.school.notFound,
            };
        }

        return {
            success: true,
            message: "Success",
            data: {
                teachers,
                subjects,
                classes,
                school,
            },
        };
    } catch (error) {
        dbLog({
            description: `Error fetching published portal data: ${error instanceof Error ? error.message : String(error)}`,
            schoolId,
        });
        return {
            success: false,
            message: messages.common.serverError,
        };
    }
}
