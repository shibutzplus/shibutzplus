import { db } from "@/db";
import { users } from "@/db/schema/users";
import { eq } from "drizzle-orm";
import { ActionResponse } from "@/models/types/actions";
import messages from "@/resources/messages";
import { UserSchema } from "@/db/schema/users";

export interface RegisterGoogleUserInput {
  email: string;
  name: string;
}

export interface RegisterGoogleUserResponse extends ActionResponse {
  data?: UserSchema;
}

export async function registerNewGoogleUserAction({ email, name }: RegisterGoogleUserInput): Promise<RegisterGoogleUserResponse> {
  try {
    const existing = await db.query.users.findFirst({ where: eq(users.email, email) });
    if (existing) {
      return {
        success: true,
        message: messages.auth.register.success,
        data: existing,
      };
    }

    const [user] = await db
      .insert(users)
      .values({
        name,
        email,
        password: "GOOGLE",
        role: "teacher",
        gender: "male",
        schoolId: null,
      })
      .returning();

    if (!user) {
      return {
        success: false,
        message: messages.auth.register.error,
      };
    }

    return {
      success: true,
      message: messages.auth.register.success,
      data: user,
    };
  } catch (error) {
    console.error("Error registering Google user:", error);
    return {
      success: false,
      message: messages.auth.register.error,
    };
  }
}

