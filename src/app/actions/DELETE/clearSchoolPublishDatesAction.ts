"use server";

import { db, schema, executeQuery } from "@/db";
import { inArray } from "drizzle-orm";
import { auth } from "@/auth";
import { USER_ROLES } from "@/models/constant/auth";

export async function clearSchoolPublishDatesAction(schoolIds: string[]): Promise<{
    success: boolean;
    error?: string;
}> {
    const session = await auth();

    if (!session || (session.user as any)?.role !== USER_ROLES.ADMIN) {
        return {
            success: false,
            error: "Unauthorized: Only administrators can clear school publish dates",
        };
    }

    if (!schoolIds || schoolIds.length === 0) {
        return { success: true };
    }

    try {
        await executeQuery(async () => {
            return await db
                .update(schema.schools)
                .set({ publishDates: [] })
                .where(inArray(schema.schools.id, schoolIds));
        });

        return { success: true };
    } catch (err: any) {
        return {
            success: false,
            error: err?.message || "Failed to clear publish dates",
        };
    }
}
