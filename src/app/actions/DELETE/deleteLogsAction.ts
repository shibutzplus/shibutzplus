"use server";

import { db, schema, executeQuery } from "@/db";
import { inArray } from "drizzle-orm";
import { auth } from "@/auth";
import { USER_ROLES } from "@/models/constant/auth";

export async function deleteLogsAction(ids: string[]): Promise<{
    success: boolean;
    error?: string;
}> {
    const session = await auth();

    if (!session || (session.user as any)?.role !== USER_ROLES.ADMIN) {
        return {
            success: false,
            error: "Unauthorized: Only administrators can delete logs",
        };
    }

    if (!ids || ids.length === 0) {
        return { success: true };
    }

    try {
        await executeQuery(async () => {
            return await db
                .delete(schema.logs)
                .where(inArray(schema.logs.id, ids));
        });

        return { success: true };
    } catch (err: any) {
        return {
            success: false,
            error: err?.message || "Failed to delete logs",
        };
    }
}
