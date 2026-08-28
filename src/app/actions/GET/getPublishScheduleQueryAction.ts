"use server";

import { db, schema, executeQuery } from "@/db";
import { sql } from "drizzle-orm";
import { auth } from "@/auth";
import { USER_ROLES } from "@/models/constant/auth";
import { getCurrentSchoolYearRange } from "@/utils/time";

export interface PublishScheduleQueryResult {
    id: string;
    name: string;
    lastPublishDate: string | null;
}

export async function getPublishScheduleQueryAction(): Promise<{
    success: boolean;
    data?: PublishScheduleQueryResult[];
    error?: string;
}> {
    const session = await auth();

    if (!session || (session.user as any)?.role !== USER_ROLES.ADMIN) {
        return {
            success: false,
            error: "Unauthorized: Only administrators can access query logs",
        };
    }

    try {
        const { start } = getCurrentSchoolYearRange();

        const rows = await executeQuery(async () => {
            return await db
                .select({
                    id: schema.schools.id,
                    name: schema.schools.name,
                    lastPublishDate: sql<string>`${schema.schools.publishDates}[array_upper(${schema.schools.publishDates}, 1)]`,
                })
                .from(schema.schools)
                .where(
                    sql`${schema.schools.publishDates} IS NOT NULL 
                    AND ${schema.schools.publishDates} <> '{}' 
                    AND ${schema.schools.publishDates}[array_upper(${schema.schools.publishDates}, 1)]::DATE >= ${start}::DATE`
                )
                .orderBy(sql`${schema.schools.publishDates}[array_upper(${schema.schools.publishDates}, 1)]::DATE DESC`);
        });

        const formatted: PublishScheduleQueryResult[] = rows.map((r) => ({
            id: r.id,
            name: r.name,
            lastPublishDate: r.lastPublishDate || null,
        }));

        return {
            success: true,
            data: formatted,
        };
    } catch (err: any) {
        return {
            success: false,
            error: err?.message || "Failed to fetch publish schedule query data",
        };
    }
}
