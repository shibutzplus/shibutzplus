"use server";

import { db } from "@/db";
import { dailySchedule } from "@/db/schema/daily-schedule";
import { eq, and } from "drizzle-orm";
import { dbLog } from "@/services/loggerService";
import { pushSyncUpdateServer } from "@/services/sync/serverSyncService";
import { DAILY_TEACHER_COL_DATA_CHANGED } from "@/models/constant/sync";
import { revalidatePath, revalidateTag } from "next/cache";
import { reasonSchema } from "@/models/validation/reason";
import { cacheTags } from "@/lib/cacheTags";

export async function updateDailyColumnReasonAction(
    schoolId: string,
    date: string,
    columnId: string,
    reason: string
) {
    // Server-side validation
    const parsed = reasonSchema.safeParse(reason);
    if (!parsed.success) {
        return { success: false, message: parsed.error.issues[0]?.message || "סיבה לא תקינה" };
    }

    try {
        await db
            .update(dailySchedule)
            .set({ reason: parsed.data, updatedAt: new Date() })
            .where(
                and(
                    eq(dailySchedule.schoolId, schoolId),
                    eq(dailySchedule.columnId, columnId),
                    eq(dailySchedule.date, date),
                ),
            );

        revalidatePath("/daily-build");
        revalidateTag(cacheTags.schoolSchedule(schoolId));
        revalidateTag(cacheTags.dailySchedule(schoolId, date));

        void pushSyncUpdateServer(DAILY_TEACHER_COL_DATA_CHANGED, { schoolId, date });

        return { success: true, message: "סיבה עודכנה בהצלחה" };
    } catch (error) {
        dbLog({
            description: `Error updating column reason: ${error instanceof Error ? error.message : String(error)}`,
            schoolId,
            metadata: { date, columnId }
        });
        return { success: false, message: "שגיאה בעדכון הסיבה" };
    }
}
