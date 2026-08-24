"use server";
/* 
* For Admin usage only 
*/
import { ActionResponse } from "@/models/types/actions";
import { revalidatePath, revalidateTag } from "next/cache";
import { cacheTags } from "@/lib/cacheTags";
import { dbLog } from "@/services/loggerService";
import messages from "@/resources/messages";
import { checkAuthAndParams } from "@/utils/authUtils";
import { pushSyncUpdateServer } from "@/services/sync/serverSyncService";
import { DAILY_PUBLISH_DATA_CHANGED, ENTITIES_DATA_CHANGED } from "@/models/constant/sync";

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
        revalidateTag(cacheTags.annualAltSchedule(schoolId));

        // Revalidate public teacher routes
        revalidatePath("/(public)/school-changes", "page");
        revalidatePath("/(public)/school-changes-full", "page");
        revalidatePath("/(public)/school-changes-alt", "page");
        revalidatePath(`/(public)/teacher-changes/${schoolId}`, "layout");
        revalidatePath(`/(public)/teacher-changes-alt/${schoolId}`, "layout");

        // Broadcast sync to all active clients (teachers and managers)
        void pushSyncUpdateServer(ENTITIES_DATA_CHANGED, { schoolId });
        void pushSyncUpdateServer(DAILY_PUBLISH_DATA_CHANGED, { schoolId });

        return { success: true, message: "המטמון נוקה בהצלחה" };
    } catch (error) {
        dbLog({
            description: `Error clearing school cache: ${error instanceof Error ? error.message : String(error)}`,
            schoolId
        });
        return { success: false, message: messages.common.serverError };
    }
}
