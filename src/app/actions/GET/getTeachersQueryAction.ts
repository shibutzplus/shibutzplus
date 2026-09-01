"use server";

import { db, schema, executeQuery } from "@/db";
import { and, asc, eq } from "drizzle-orm";
import { auth } from "@/auth";
import { USER_ROLES } from "@/models/constant/auth";

export interface TeacherQueryResult {
    id: string;
    name: string;
    role: string;
    schoolId: string;
    schoolName: string | null;
}

export async function getTeachersQueryAction(): Promise<{
    success: boolean;
    data?: TeacherQueryResult[];
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
                    id: schema.teachers.id,
                    name: schema.teachers.name,
                    role: schema.teachers.role,
                    schoolId: schema.teachers.schoolId,
                    schoolName: schema.schools.name,
                })
                .from(schema.teachers)
                .innerJoin(schema.schools, eq(schema.teachers.schoolId, schema.schools.id))
                .where(
                    and(
                        eq(schema.teachers.isActive, true),
                        eq(schema.schools.isActive, true)
                    )
                )
                .orderBy(asc(schema.schools.name), asc(schema.teachers.name));
        });

        const formatted: TeacherQueryResult[] = rows.map((r) => ({
            id: r.id,
            name: r.name,
            role: r.role,
            schoolId: r.schoolId,
            schoolName: r.schoolName || null,
        }));

        return {
            success: true,
            data: formatted,
        };
    } catch (err: any) {
        return {
            success: false,
            error: err?.message || "Failed to fetch teachers query data",
        };
    }
}
