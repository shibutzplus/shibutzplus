"use server";
import "server-only";

import { db, executeQuery } from "@/db";
import { users } from "@/db/schema/users";
import { eq } from "drizzle-orm";
import type { ActionResponse } from "@/models/types/actions";
import messages from "@/resources/messages";
import type { UserSchema } from "@/db/schema/users";

export interface RegisterGoogleUserInput {
    email: string;
}

export interface RegisterGoogleUserResponse extends ActionResponse {
    data?: UserSchema;
}

export async function registerNewGoogleUserAction({
    email,
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
