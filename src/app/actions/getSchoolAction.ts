"use server";

import { getSchoolById } from "@/db/utils";
import { unstable_cache } from "next/cache";
import { GetSchoolResponse } from "@/models/types/school";
import { checkAuthAndParams } from "@/utils/authUtils";
import { CACHE_DURATION_1_HOUR } from "@/utils/time";
import messages from "@/resources/messages";

// Cache school data with a 1-hour revalidation period
const getCachedSchool = unstable_cache(
    async (schoolId: string) => {
        return await getSchoolById(schoolId);
    },
    ["school-data"],
    { revalidate: CACHE_DURATION_1_HOUR },
);

export async function getSchoolAction(schoolId: string): Promise<GetSchoolResponse> {
    try {
        const authError = await checkAuthAndParams({ schoolId });
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
            message: messages.school.retrieveSuccess,
            data: school,
        };
    } catch (error) {
        console.error("Error fetching school:", error);
        return {
            success: false,
            message: messages.school.retrieveError,
        };
    }
}
