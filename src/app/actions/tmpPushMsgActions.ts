"use server";

import { db, schema, executeQuery } from "@/db";
import { eq, and } from "drizzle-orm";

export async function checkPushMsgClosedAction(schoolId?: string, teacherName?: string): Promise<boolean> {
    if (!schoolId && !teacherName) return false;

    try {
        return await executeQuery(async () => {
            const conditions = [eq(schema.logs.description, "[PushMsg] Closed")];
            if (schoolId) conditions.push(eq(schema.logs.schoolId, schoolId));
            const resolvedUser = teacherName || "Unknown User";
            conditions.push(eq(schema.logs.user, resolvedUser));

            const existingLogs = await db
                .select({ id: schema.logs.id })
                .from(schema.logs)
                .where(and(...conditions))
                .limit(1);

            return existingLogs.length > 0;
        });
    } catch (error) {
        console.error("Error checking push msg closed log:", error);
        return false;
    }
}

export async function deletePushMsgClosedAction(schoolId?: string, teacherName?: string) {
    if (!schoolId && !teacherName) return { success: false };

    try {
        await executeQuery(async () => {
            const conditions = [eq(schema.logs.description, "[PushMsg] Closed")];
            if (schoolId) conditions.push(eq(schema.logs.schoolId, schoolId));
            const resolvedUser = teacherName || "Unknown User";
            conditions.push(eq(schema.logs.user, resolvedUser));

            await db.delete(schema.logs).where(and(...conditions));
        });
        return { success: true };
    } catch (error) {
        console.error("Error deleting push msg closed log:", error);
        return { success: false };
    }
}
