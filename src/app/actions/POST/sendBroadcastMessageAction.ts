"use server";

import { auth } from "@/auth";
import { USER_ROLES } from "@/models/constant/auth";
import { ADMIN_BROADCAST_MESSAGE } from "@/models/constant/sync";
import { pushSyncUpdateServer } from "@/services/sync/serverSyncService";
import { dbLog } from "@/services/loggerService";

export interface SendBroadcastMessageParams {
    message: string;
    targetSchoolId?: string; // empty or "all" for all schools
    targetUserId?: string;   // empty or "all" for all users
    targetAudience?: "all" | "teachers" | "managers";
}

export async function sendBroadcastMessageAction(params: SendBroadcastMessageParams) {
    try {
        const session = await auth();

        if (!session || (session.user as any)?.role !== USER_ROLES.ADMIN) {
            return {
                success: false,
                message: "אין הרשאת מנהל מערכת לשליחת הודעות",
            };
        }

        const trimmedMessage = params.message?.trim();
        if (!trimmedMessage) {
            return {
                success: false,
                message: "תוכן ההודעה לא יכול להיות ריק",
            };
        }

        const senderName = "שיבוץ פלוס";

        const pushTs = await pushSyncUpdateServer(ADMIN_BROADCAST_MESSAGE, {
            message: trimmedMessage,
            targetSchoolId: params.targetSchoolId && params.targetSchoolId !== "all" ? params.targetSchoolId : undefined,
            targetUserId: params.targetUserId && params.targetUserId !== "all" ? params.targetUserId : undefined,
            targetAudience: params.targetAudience,
            senderName,
        });

        if (!pushTs) {
            dbLog({
                description: `sendBroadcastMessageAction: pushSyncUpdateServer returned null`,
                schoolId: params.targetSchoolId && params.targetSchoolId !== "all" ? params.targetSchoolId : undefined,
            });
            return {
                success: false,
                message: "שגיאה בשליחת ההודעה לשרת הסנכרון",
            };
        }

        return {
            success: true,
            message: "ההודעה נשלחה בהצלחה",
        };
    } catch (err) {
        dbLog({
            description: `sendBroadcastMessageAction failed: ${err instanceof Error ? err.message : String(err)}`,
            schoolId: params.targetSchoolId && params.targetSchoolId !== "all" ? params.targetSchoolId : undefined,
        });
        return {
            success: false,
            message: "שגיאה לא צפויה בשליחת ההודעה",
        };
    }
}
