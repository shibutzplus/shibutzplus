"use server";

import { SchoolStatus } from "@/models/types/school";
import { UserSchema } from "@/db/schema/users";
import messages from "@/resources/messages";
import { db, schema } from "@/db";
import { eq } from "drizzle-orm";

type GetUserWithSchoolStatusResponse = {
    success: boolean;
    message: string;
    data?: UserSchema & { status: SchoolStatus };
};

export async function getUserByEmailAction(
    email: string,
): Promise<GetUserWithSchoolStatusResponse> {
    try {
        const user = (await db.select().from(schema.users).where(eq(schema.users.email, email)))[0];

        if (!user) {
            return {
                success: false,
                message: messages.auth.unauthorized,
            };
        }

        let status = "onboarding" as SchoolStatus;
        if (user.schoolId) {
            const school = (
                await db.select().from(schema.schools).where(eq(schema.schools.id, user.schoolId))
            )[0];
            if (school && school.status) {
                status = school.status as SchoolStatus;
            }
        }

        return {
            success: true,
            message: messages.auth.login.success,
            data: { ...user, status },
        };
    } catch (error) {
        return {
            success: false,
            message: messages.common.serverError,
        };
    }
}
