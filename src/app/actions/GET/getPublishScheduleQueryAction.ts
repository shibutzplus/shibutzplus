"use server";

import { db, schema, executeQuery } from "@/db";
import { asc, eq } from "drizzle-orm";
import { auth } from "@/auth";
import { USER_ROLES } from "@/models/constant/auth";

export interface PublishScheduleQueryResult {
    id: string;
    name: string;
    city: string | null;
    fromHour: number;
    toHour: number;
    publishDates: string[];
    lastPublishDate: string | null;
    totalPublishedDays: number;
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
        const rows = await executeQuery(async () => {
            return await db
                .select({
                    id: schema.schools.id,
                    name: schema.schools.name,
                    city: schema.schools.city,
                    fromHour: schema.schools.fromHour,
                    toHour: schema.schools.toHour,
                    publishDates: schema.schools.publishDates,
                })
                .from(schema.schools)
                .where(eq(schema.schools.isActive, true))
                .orderBy(asc(schema.schools.name));
        });

        const formatted: PublishScheduleQueryResult[] = rows.map((r) => {
            const dates = Array.isArray(r.publishDates)
                ? [...r.publishDates].sort((a, b) => b.localeCompare(a))
                : [];
            return {
                id: r.id,
                name: r.name,
                city: r.city || null,
                fromHour: r.fromHour ?? 1,
                toHour: r.toHour ?? 10,
                publishDates: dates,
                lastPublishDate: dates.length > 0 ? dates[0] : null,
                totalPublishedDays: dates.length,
            };
        });

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
