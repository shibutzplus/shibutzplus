"use server";

import { db, schema, executeQuery } from "@/db";
import { ClassType, ClassRequest } from "@/models/types/classes";
import { ActionResponse } from "@/models/types/actions";
import { checkAuthAndParams, checkIsNotGuest } from "@/utils/authUtils";
import messages from "@/resources/messages";
import { classSchema } from "@/models/validation/class";
import { dbLog } from "@/services/loggerService";
import { pushSyncUpdateServer } from "@/services/sync/serverSyncService";
import { ENTITIES_DATA_CHANGED } from "@/models/constant/sync";
import { revalidateTag } from "next/cache";
import { cacheTags } from "@/lib/cacheTags";

export async function addClassAction(
    classData: ClassRequest,
): Promise<ActionResponse & { data?: ClassType; errorCode?: string }> {
    try {
        const validation = classSchema.safeParse(classData);
        if (!validation.success) {
            return {
                success: false,
                message: validation.error.issues[0]?.message || "נתונים לא תקינים",
            };
        }

        const guestError = await checkIsNotGuest();
        if (guestError) {
            return guestError as ActionResponse;
        }

        const authError = await checkAuthAndParams({
            name: classData.name,
            schoolId: classData.schoolId,
        });
        if (authError) return authError as ActionResponse;

        const newClass = await executeQuery(async () => {
            return (await db.insert(schema.classes).values(classData).returning())[0];
        });

        if (!newClass) {
            return { success: false, message: messages.classes.createError };
        }

        // Invalidate cache - class changes affect schedules AND lists
        revalidateTag(cacheTags.classesList(classData.schoolId));
        revalidateTag(cacheTags.schoolSchedule(classData.schoolId));

        void pushSyncUpdateServer(ENTITIES_DATA_CHANGED, { schoolId: classData.schoolId });

        return {
            success: true,
            message: messages.classes.createClassSuccess,
            data: newClass,
        };
    } catch (error: any) {
        const pgCode = error?.code ?? error?.cause?.code ?? error?.originalError?.code;
        if (pgCode === "23505") {
            return {
                success: false,
                errorCode: "23505",
                message: `"${classData.name}" כבר ברשימה.`,
            };
        } else {
            dbLog({ description: `Error adding class: ${error instanceof Error ? error.message : String(error)}`, schoolId: classData.schoolId });
        }
        return { success: false, message: messages.common.serverError };
    }
}
