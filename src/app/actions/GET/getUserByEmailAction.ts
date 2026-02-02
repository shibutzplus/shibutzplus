"use server";
import "server-only";

import { db, schema, executeQuery } from "@/db";
import { eq } from "drizzle-orm";
import { dbLog } from "@/services/loggerService";
import type { UserSchema } from "@/db/schema/users";
import type { SchoolStatus } from "@/models/types/school";
import { SCHOOL_STATUS } from "@/models/constant/school";
import messages from "@/resources/messages";

type GetUserWithSchoolStatusResponse = {
    success: boolean;
    message: string;
    data?: Omit<UserSchema, "password"> & { status: SchoolStatus };
};

export async function getUserByEmailAction(
    email: string,
): Promise<GetUserWithSchoolStatusResponse> {
    try {
        const [row] = await executeQuery(async () => {
            return await db
                .select({
                    id: schema.users.id,
                    name: schema.users.name,
                    email: schema.users.email,
                    role: schema.users.role,
                    gender: schema.users.gender,
                    authType: schema.users.authType,
                    schoolId: schema.users.schoolId,
                    createdAt: schema.users.createdAt,
                    updatedAt: schema.users.updatedAt,
                    status: schema.schools.status,
                })
                .from(schema.users)
                .leftJoin(schema.schools, eq(schema.schools.id, schema.users.schoolId))
                .where(eq(schema.users.email, email))
                .limit(1);
        });

        if (!row) return { success: false, message: messages.auth.unauthorized };

        const status = (row.status ?? SCHOOL_STATUS.ONBOARDING) as SchoolStatus;

        const user: Omit<UserSchema, "password"> = {
            id: row.id,
            name: row.name,
            email: row.email,
            role: row.role,
            gender: row.gender,
            authType: row.authType,
            schoolId: row.schoolId,
            createdAt: row.createdAt,
            updatedAt: row.updatedAt,
        };

        return { success: true, message: messages.auth.login.success, data: { ...user, status } };
    } catch (err) {
        dbLog({ description: `Error getUserByEmailAction: ${err instanceof Error ? err.message : String(err)}` });
        return { success: false, message: messages.common.serverError };
    }
}
