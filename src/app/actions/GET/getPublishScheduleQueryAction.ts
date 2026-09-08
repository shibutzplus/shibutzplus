"use server";

import { db, schema, executeQuery } from "@/db";
import { asc, eq, inArray } from "drizzle-orm";
import { auth } from "@/auth";
import { USER_ROLES } from "@/models/constant/auth";

export interface PublishScheduleQueryResult {
    id: string;
    name: string;
    deputyName: string | null;
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

        const usersRows = await executeQuery(async () => {
            return await db
                .select({
                    schoolId: schema.users.schoolId,
                    name: schema.users.name,
                    role: schema.users.role,
                    isActive: schema.users.isActive,
                })
                .from(schema.users)
                .where(
                    inArray(schema.users.role, [USER_ROLES.DEPUTY_PRINCIPAL, USER_ROLES.PRINCIPAL])
                );
        });

        const usersBySchool = new Map<string, { name: string; role: string; isActive: boolean }[]>();
        for (const u of usersRows) {
            if (!u.schoolId) continue;
            if (!usersBySchool.has(u.schoolId)) usersBySchool.set(u.schoolId, []);
            usersBySchool.get(u.schoolId)!.push(u);
        }

        const formatted: PublishScheduleQueryResult[] = rows.map((r) => {
            const dates = Array.isArray(r.publishDates)
                ? [...r.publishDates].sort((a, b) => b.localeCompare(a))
                : [];

            const sUsers = usersBySchool.get(r.id) || [];
            const activeDeputies = sUsers.filter((u) => u.role === USER_ROLES.DEPUTY_PRINCIPAL && u.isActive);
            const allDeputies = sUsers.filter((u) => u.role === USER_ROLES.DEPUTY_PRINCIPAL);
            const activePrincipals = sUsers.filter((u) => u.role === USER_ROLES.PRINCIPAL && u.isActive);
            const allPrincipals = sUsers.filter((u) => u.role === USER_ROLES.PRINCIPAL);

            const pickedUsers =
                activeDeputies.length > 0
                    ? activeDeputies
                    : allDeputies.length > 0
                    ? allDeputies
                    : activePrincipals.length > 0
                    ? activePrincipals
                    : allPrincipals;

            const uniqueNames = Array.from(new Set(pickedUsers.map((u) => u.name.trim()))).filter(Boolean);
            const deputyName = uniqueNames.length > 0 ? uniqueNames.join(", ") : null;

            return {
                id: r.id,
                name: r.name,
                deputyName,
                city: r.city || null,
                fromHour: r.fromHour ?? 1,
                toHour: r.toHour ?? 10,
                publishDates: dates,
                lastPublishDate: dates.length > 0 ? dates[0] : null,
                totalPublishedDays: dates.length,
            };
        });

        formatted.sort((a, b) => {
            const dateA = a.lastPublishDate || "";
            const dateB = b.lastPublishDate || "";
            if (!dateA && !dateB) return a.name.localeCompare(b.name, "he");
            if (!dateA) return 1;
            if (!dateB) return -1;
            const cmp = dateB.localeCompare(dateA);
            if (cmp !== 0) return cmp;
            return a.name.localeCompare(b.name, "he");
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
