"use server";

import { db, schema, executeQuery } from "@/db";
import { desc, eq } from "drizzle-orm";
import { auth } from "@/auth";
import { USER_ROLES } from "@/models/constant/auth";

export interface LogQueryResult {
    id: string;
    schoolId: string | null;
    schoolName: string | null;
    user: string | null;
    teacherId: string | null;
    teacherName: string | null;
    description: string;
    metadata: any;
    timeStamp: string;
    createdAt: string;
}

export async function getLogsQueryAction(limit = 300): Promise<{
    success: boolean;
    data?: LogQueryResult[];
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
        // Direct real-time execution without caching
        const rows = await executeQuery(async () => {
            return await db
                .select({
                    id: schema.logs.id,
                    schoolId: schema.logs.schoolId,
                    schoolName: schema.schools.name,
                    user: schema.logs.user,
                    teacherId: schema.teachers.id,
                    teacherName: schema.teachers.name,
                    description: schema.logs.description,
                    metadata: schema.logs.metadata,
                    timeStamp: schema.logs.timeStamp,
                    createdAt: schema.logs.createdAt,
                })
                .from(schema.logs)
                .leftJoin(schema.schools, eq(schema.logs.schoolId, schema.schools.id))
                .leftJoin(schema.teachers, eq(schema.logs.user, schema.teachers.id))
                .orderBy(desc(schema.logs.timeStamp))
                .limit(limit);
        });

        const formatted: LogQueryResult[] = rows.map((r) => ({
            id: r.id,
            schoolId: r.schoolId,
            schoolName: r.schoolName || null,
            user: r.user || null,
            teacherId: r.teacherId || r.user || null,
            teacherName: r.teacherName || null,
            description: r.description || "",
            metadata: r.metadata,
            timeStamp: r.timeStamp ? new Date(r.timeStamp).toISOString() : "",
            createdAt: r.createdAt ? new Date(r.createdAt).toISOString() : "",
        }));

        return {
            success: true,
            data: formatted,
        };
    } catch (err: any) {
        return {
            success: false,
            error: err?.message || "Failed to fetch logs from database",
        };
    }
}
