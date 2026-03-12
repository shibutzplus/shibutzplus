"use server";

import { db, schema, executeQuery } from "@/db";
import { eq, and } from "drizzle-orm";
import { ActionResponse } from "@/models/types/actions";
import { checkAuthAndParams } from "@/utils/authUtils";
import { reasonSchema } from "@/models/validation/reason";
import { revalidateTag } from "next/cache";
import { cacheTags } from "@/lib/cacheTags";
import { dbLog } from "@/services/loggerService";
import messages from "@/resources/messages";

export const updateHistoryReasonAction = async (
    schoolId: string,
    date: string,
    originalTeacher: string,
    newReason: string
): Promise<ActionResponse> => {
    try {
        const authError = await checkAuthAndParams({ schoolId });
        if (authError) {
            return authError as ActionResponse;
        }

        const parsed = reasonSchema.safeParse(newReason);
        if (!parsed.success) {
            return { success: false, message: parsed.error.issues[0]?.message || "סיבה לא תקינה" };
        }

        await executeQuery(async () => {
            return await db
                .update(schema.history)
                .set({ reason: parsed.data, updatedAt: new Date() })
                .where(
                    and(
                        eq(schema.history.schoolId, schoolId),
                        eq(schema.history.date, date),
                        eq(schema.history.originalTeacher, originalTeacher)
                    )
                );
        });

        revalidateTag(cacheTags.history(schoolId));
        revalidateTag(cacheTags.historyByDate(schoolId, date));

        return {
            success: true,
            message: "הסיבה עודכנה בהצלחה",
        };

    } catch (error) {
        dbLog({ 
            description: `Error updating history reason: ${error instanceof Error ? error.message : String(error)}`, 
            schoolId,
            metadata: { date, originalTeacher }
        });
        return {
            success: false,
            message: messages.common.serverError,
        };
    }
}
