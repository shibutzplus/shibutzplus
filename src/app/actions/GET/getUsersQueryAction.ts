"use server";

import { db, schema, executeQuery } from "@/db";
import { asc, eq } from "drizzle-orm";
import { auth } from "@/auth";
import { USER_ROLES } from "@/models/constant/auth";

export interface UserQueryResult {
    id: string;
    name: string;
    email: string;
    role: string;
    schoolId: string | null;
    schoolName: string | null;
}

export async function getUsersQueryAction(isActive = true): Promise<{
    success: boolean;
    data?: UserQueryResult[];
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
                    id: schema.users.id,
                    name: schema.users.name,
                    email: schema.users.email,
                    role: schema.users.role,
                    schoolId: schema.users.schoolId,
                    schoolName: schema.schools.name,
                })
                .from(schema.users)
                .leftJoin(schema.schools, eq(schema.users.schoolId, schema.schools.id))
                .where(eq(schema.users.isActive, isActive))
                .orderBy(asc(schema.users.name));
        });

        const formatted: UserQueryResult[] = rows.map((r) => ({
            id: r.id,
            name: r.name,
            email: r.email,
            role: r.role,
            schoolId: r.schoolId || null,
            schoolName: r.schoolName || null,
        }));

        return {
            success: true,
            data: formatted,
        };
    } catch (err: any) {
        return {
            success: false,
            error: err?.message || "Failed to fetch users query data",
        };
    }
}
