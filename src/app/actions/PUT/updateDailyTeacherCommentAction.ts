"use server";

import { db } from "@/db";
import { dailySchedule } from "@/db/schema/daily-schedule";
import { eq, and } from "drizzle-orm";
import { dbLog } from "@/services/loggerService";
import { pushSyncUpdateServer } from "@/services/sync/serverSyncService";
import { DAILY_TEACHER_COL_DATA_CHANGED } from "@/models/constant/sync";
import { revalidatePath } from "next/cache";
import { revalidateTag } from "next/cache";
import { teacherCommentSchema } from "@/models/validation/teacherComment";
import { cacheTags } from "@/lib/cacheTags";

export async function updateDailyTeacherCommentAction(
    schoolId: string,
    date: string,
    columnId: string,
    hour: number,
    comment: string,
    additionalData?: {
        day: number;
        position: number;
        columnType: number;
        originalTeacherId?: string;
        subjectId?: string;
        classIds?: string[];
    }
) {
    const parsed = teacherCommentSchema.safeParse(comment);
    if (!parsed.success) {
        return { success: false, message: parsed.error.issues[0]?.message || "הערה לא תקינה" };
    }

    try {
        const updateResult = await db
            .update(dailySchedule)
            .set({ comment: parsed.data || null, updatedAt: new Date() })
            .where(
                and(
                    eq(dailySchedule.schoolId, schoolId),
                    eq(dailySchedule.columnId, columnId),
                    eq(dailySchedule.date, date),
                    eq(dailySchedule.hour, hour),
                ),
            )
            .returning({ id: dailySchedule.id });

        if (updateResult.length === 0 && additionalData) {
            await db.insert(dailySchedule).values({
                schoolId,
                date: date,
                columnId,
                hour,
                comment: parsed.data || null,
                day: additionalData.day,
                position: additionalData.position,
                columnType: additionalData.columnType,
                originalTeacherId: additionalData.originalTeacherId || null,
                subjectId: additionalData.subjectId || null,
                classIds: additionalData.classIds || null,
            });
        }

        revalidatePath("/daily-build");
        revalidateTag(cacheTags.dailySchedule(schoolId, date));
        revalidateTag(cacheTags.schoolSchedule(schoolId));

        void pushSyncUpdateServer(DAILY_TEACHER_COL_DATA_CHANGED, { schoolId, date });

        return { success: true, message: "הערה עודכנה בהצלחה" };
    } catch (error) {
        dbLog({
            description: `Error updating teacher comment: ${error instanceof Error ? error.message : String(error)}`,
            schoolId,
            metadata: { date, columnId, hour }
        });
        return { success: false, message: "שגיאה בעדכון ההערה" };
    }
}
