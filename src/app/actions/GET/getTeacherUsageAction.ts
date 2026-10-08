"use server";

import { checkAuthAndParams } from "@/utils/authUtils";
import { getTeacherUsageCount, EntityUsageSummary } from "@/services/entities/entityUsageService";
import { ActionResponse } from "@/models/types/actions";
import { dbLog } from "@/services/loggerService";

export async function getTeacherUsageAction(
    schoolId: string,
    teacherId: string,
): Promise<ActionResponse & { usage?: EntityUsageSummary }> {
    try {
        const authError = await checkAuthAndParams({ schoolId, teacherId });
        if (authError) {
            return authError as ActionResponse;
        }

        const usage = await getTeacherUsageCount(schoolId, teacherId);
        return {
            success: true,
            usage,
        };
    } catch (error) {
        dbLog({
            description: `Error fetching teacher usage: ${error instanceof Error ? error.message : String(error)}`,
            schoolId,
            metadata: { teacherId },
        });
        return {
            success: false,
            message: "שגיאה בבדיקת שיבוצי המורה",
        };
    }
}
