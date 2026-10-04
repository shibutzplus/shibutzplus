"use server";

import { TeacherType } from "@/models/types/teachers";
import { ActionResponse } from "@/models/types/actions";
import { checkAuthAndParams, checkIsNotGuest } from "@/utils/authUtils";
import messages from "@/resources/messages";
import { db, schema, executeQuery } from "@/db";
import { eq, and } from "drizzle-orm";
import { dbLog } from "@/services/loggerService";
import { pushSyncUpdateServer } from "@/services/sync/serverSyncService";
import { ENTITIES_DATA_CHANGED } from "@/models/constant/sync";
import { revalidateTag } from "next/cache";
import { cacheTags } from "@/lib/cacheTags";

/**
 * Toggles the temporary paused status of a teacher (e.g. maternity leave).
 * Updates ONLY the isPaused field, so it never overrides concurrent name/role edits.
 */
export async function toggleTeacherPauseAction(
    schoolId: string,
    teacherId: string,
    isPaused: boolean,
): Promise<ActionResponse & { data?: TeacherType[] }> {
    try {
        const authError = await checkAuthAndParams({ schoolId, teacherId, isPaused });
        if (authError) return authError as ActionResponse;

        const guestError = await checkIsNotGuest();
        if (guestError) return guestError as ActionResponse;

        const updated = await executeQuery(async () => {
            return await db
                .update(schema.teachers)
                .set({ isPaused, updatedAt: new Date() })
                .where(and(eq(schema.teachers.id, teacherId), eq(schema.teachers.schoolId, schoolId)))
                .returning({ id: schema.teachers.id });
        });

        if (!updated || updated.length === 0) {
            return { success: false, message: messages.teachers.updateError };
        }

        const allTeachers = await executeQuery(async () => {
            return await db
                .select()
                .from(schema.teachers)
                .where(and(eq(schema.teachers.schoolId, schoolId), eq(schema.teachers.isActive, true)))
                .orderBy(schema.teachers.name);
        });

        // Paused status affects only the teachers list (not schedule data)
        revalidateTag(cacheTags.teachersList(schoolId));
        await pushSyncUpdateServer(ENTITIES_DATA_CHANGED, { schoolId });

        return {
            success: true,
            message: messages.teachers.updateSuccess,
            data: (allTeachers || []) as TeacherType[],
        };
    } catch (error) {
        dbLog({
            description: `Error toggling teacher pause: ${error instanceof Error ? error.message : String(error)}`,
            schoolId,
            user: teacherId,
        });
        return { success: false, message: messages.common.serverError };
    }
}
