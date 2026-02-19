"use server";
/* 
* For Admin usage only 
*/
import { ActionResponse } from "@/models/types/actions";
import { revalidateTag } from "next/cache";
import { cacheTags } from "@/lib/cacheTags";
import { dbLog } from "@/services/loggerService";
import messages from "@/resources/messages";
import { checkAuthAndParams } from "@/utils/authUtils";

export async function clearSchoolCacheAction(schoolId: string): Promise<ActionResponse> {
    try {
        const authError = await checkAuthAndParams({ schoolId });
        if (authError) return authError;

        // Clear all relevant caches for the school
        revalidateTag(cacheTags.school(schoolId));
        revalidateTag(cacheTags.schoolSchedule(schoolId));
        revalidateTag(cacheTags.dailyScheduleSchool(schoolId));
        revalidateTag(cacheTags.teachersList(schoolId));
        revalidateTag(cacheTags.subjectsList(schoolId));
        revalidateTag(cacheTags.classesList(schoolId));
        revalidateTag(cacheTags.history(schoolId));

        return { success: true, message: "המטמון נוקה בהצלחה" };
    } catch (error) {
        dbLog({
            description: `Error clearing school cache: ${error instanceof Error ? error.message : String(error)}`,
            schoolId
        });
        return { success: false, message: messages.common.serverError };
    }
}
