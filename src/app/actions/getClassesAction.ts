"use server";

import { getClassesBySchool } from "@/db/utils";
import { unstable_cache } from "next/cache";
import { GetClassesResponse } from "@/models/types/classes";
import { checkAuthAndParams } from "@/utils/authUtils";
import { CACHE_DURATION_1_HOUR } from "@/utils/time";
import messages from "@/resources/messages";

// Cache classes data with a 1-hour revalidation period
const getCachedClasses = unstable_cache(
    async (schoolId: string) => {
        return await getClassesBySchool(schoolId);
    },
    ["classes-data"],
    { revalidate: CACHE_DURATION_1_HOUR },
);

export async function getClassesAction(schoolId: string): Promise<GetClassesResponse> {
    try {
        const authError = await checkAuthAndParams({ schoolId });
        if (authError) {
            return authError as GetClassesResponse;
        }

        const classes = await getCachedClasses(schoolId);
        return {
            success: true,
            message: messages.classes.retrieveSuccess,
            data: classes,
        };
    } catch (error) {
        console.error("Error fetching classes:", error);
        return {
            success: false,
            message: messages.classes.retrieveError,
        };
    }
}
