"use server";

import { getSubjectsBySchool } from "@/db/utils";
import { unstable_cache } from "next/cache";
import { GetSubjectsResponse } from "@/models/types/subjects";
import { checkAuthAndParams } from "@/utils/authUtils";
import { CACHE_DURATION_1_HOUR } from "@/utils/time";
import messages from "@/resources/messages";

// Cache subjects data with a 1-hour revalidation period
const getCachedSubjects = unstable_cache(
    async (schoolId: string) => {
        return await getSubjectsBySchool(schoolId);
    },
    ["subjects-data"],
    { revalidate: CACHE_DURATION_1_HOUR },
);

export async function getSubjectsAction(schoolId: string): Promise<GetSubjectsResponse> {
    try {
        const authError = await checkAuthAndParams({ schoolId });
        if (authError) {
            return authError as GetSubjectsResponse;
        }

        const subjects = await getCachedSubjects(schoolId);
        return {
            success: true,
            message: messages.subjects.retrieveSuccess,
            data: subjects,
        };
    } catch (error) {
        console.error("Error fetching subjects:", error);
        return {
            success: false,
            message: messages.subjects.retrieveError,
        };
    }
}
