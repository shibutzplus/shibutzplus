"use server";

import { db, schema, executeQuery } from "@/db";
import { inArray } from "drizzle-orm";
import { auth } from "@/auth";
import { USER_ROLES } from "@/models/constant/auth";

export async function deletePushSubscriptionsAction(teacherIds: string[]): Promise<{
    success: boolean;
    error?: string;
}> {
    const session = await auth();

    if (!session || (session.user as any)?.role !== USER_ROLES.ADMIN) {
        return {
            success: false,
            error: "Unauthorized: Only administrators can delete push subscriptions",
        };
    }

    if (!teacherIds || teacherIds.length === 0) {
        return { success: true };
    }

    try {
        await executeQuery(async () => {
            return await db
                .delete(schema.pushSubscriptions)
                .where(inArray(schema.pushSubscriptions.teacherId, teacherIds));
        });

        return { success: true };
    } catch (err: any) {
        return {
            success: false,
            error: err?.message || "Failed to delete push subscriptions",
        };
    }
}
