"use server";

import { getTeachersBySchool } from "@/db/utils";
import { unstable_cache } from "next/cache";
import { GetTeachersResponse } from "@/models/types/teachers";
import { checkAuthAndParams } from "@/utils/authUtils";
import { CACHE_DURATION_1_HOUR } from "@/utils/time";

// Cache teachers data with a 1-hour revalidation period
const getCachedTeachers = unstable_cache(
    async (schoolId: string) => {
        return await getTeachersBySchool(schoolId);
    },
    ["teachers-data"],
    { revalidate: CACHE_DURATION_1_HOUR },
);

export async function getTeachersAction(schoolId: string): Promise<GetTeachersResponse> {
    try {
        const authError = await checkAuthAndParams({ schoolId });
        if (authError) {
            return authError as GetTeachersResponse;
        }

        const teachers = await getCachedTeachers(schoolId);
        return {
            success: true,
            message: "Teachers retrieved successfully",
            data: teachers,
        };
    } catch (error) {
        console.error("Error fetching teachers:", error);
        return {
            success: false,
            message: "Failed to retrieve teachers. Please try again later.",
        };
    }
}
