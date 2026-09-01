"use server";

import { db, schema, executeQuery } from "@/db";
import { countDistinct, desc, eq, max } from "drizzle-orm";
import { auth } from "@/auth";
import { USER_ROLES } from "@/models/constant/auth";

export interface PushSubscriberQueryResult {
    id: string;
    schoolName: string;
    teacherId: string;
    teacherName: string;
    subscriptionCount: number;
    createdAt: string | null;
}

export async function getPushSubscribersQueryAction(): Promise<{
    success: boolean;
    data?: PushSubscriberQueryResult[];
    error?: string;
}> {
    const session = await auth();

    if (!session || (session.user as any)?.role !== USER_ROLES.ADMIN) {
        return {
            success: false,
            error: "Unauthorized: Only administrators can access queries",
        };
    }

    try {
        const rows = await executeQuery(async () => {
            return await db
                .select({
                    teacherId: schema.teachers.id,
                    teacherName: schema.teachers.name,
                    schoolName: schema.schools.name,
                    subscriptionCount: countDistinct(schema.pushSubscriptions.id),
                    createdAt: max(schema.pushSubscriptions.createdAt),
                })
                .from(schema.teachers)
                .innerJoin(schema.schools, eq(schema.teachers.schoolId, schema.schools.id))
                .innerJoin(schema.pushSubscriptions, eq(schema.teachers.id, schema.pushSubscriptions.teacherId))
                .groupBy(schema.teachers.id, schema.teachers.name, schema.schools.name)
                .orderBy(desc(max(schema.pushSubscriptions.createdAt)));
        });

        const formatted: PushSubscriberQueryResult[] = rows.map((r) => ({
            id: r.teacherId,
            schoolName: r.schoolName || "",
            teacherId: r.teacherId,
            teacherName: r.teacherName || "",
            subscriptionCount: Number(r.subscriptionCount) || 0,
            createdAt: r.createdAt ? new Date(r.createdAt).toISOString() : null,
        }));

        return {
            success: true,
            data: formatted,
        };
    } catch (err: any) {
        return {
            success: false,
            error: err?.message || "Failed to fetch push subscribers query data",
        };
    }
}
