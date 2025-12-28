import "server-only";

import { db, executeQuery, schema } from "@/db";
import { users } from "@/db/schema/users";
import { eq } from "drizzle-orm";
import type { ActionResponse } from "@/models/types/actions";
import messages from "@/resources/messages";
import type { UserSchema } from "@/db/schema/users";
import bcrypt from "bcryptjs";

export interface RegisterGoogleUserInput {
    email: string;
    name: string;
}

export interface RegisterGoogleUserResponse extends ActionResponse {
    data?: UserSchema;
}

export async function registerNewGoogleUserAction({
    email,
    name,
}: RegisterGoogleUserInput): Promise<RegisterGoogleUserResponse> {
    try {
        const existing = await executeQuery(async () => {
            return await db.query.users.findFirst({ where: eq(users.email, email) });
        });

        if (existing) {
            return {
                success: true,
                message: messages.auth.register.success,
                data: existing,
            };
        }

        // User does not exist, create new user
        const hashedPassword = await bcrypt.hash("123456", 10);
        const schoolId = "ebrb8pj1ofvug78ratnbyd4o"; // Hardcoded school ID for "הדגמה"

        const newUser = await executeQuery(async () => {
            const [createdUser] = await db
                .insert(schema.users)
                .values({
                    name: name,
                    email: email,
                    password: hashedPassword,
                    role: "guest",
                    gender: "female",
                    authType: "google",
                    schoolId: schoolId,
                })
                .returning();
            return createdUser;
        });

        if (newUser) {
            return {
                success: true,
                message: messages.auth.register.success,
                data: newUser,
            };
        }

        return {
            success: false,
            message: messages.auth.register.error,
        };
    } catch (error) {
        console.error("Error registering Google user:", error);
        return {
            success: false,
            message: messages.auth.register.error,
        };
    }
}
