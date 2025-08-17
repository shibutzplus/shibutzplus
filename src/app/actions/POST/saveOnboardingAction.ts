"use server";

import { checkAuthAndParams } from "@/utils/authUtils";
import messages from "@/resources/messages";
import { db, schema } from "../../../db";
import { ActionResponse } from "@/models/types/actions";
import { getServerSession } from "next-auth";
import { authOptions } from "../../api/auth/[...nextauth]/route";
import { eq } from "drizzle-orm";

interface OnboardingData {
    name: string;
    gender: string;
    role: string;
    schoolName: string;
}

export async function saveOnboardingAction(
    data: OnboardingData,
): Promise<ActionResponse> {
    try {
        const { name, gender, role, schoolName } = data;

        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return {
                success: false,
                message: messages.auth.unauthorized,
            };
        }

        const authError = await checkAuthAndParams({
            name,
            gender,
            role,
            schoolName,
        });
        if (authError) {
            return authError as ActionResponse;
        }

        // First, create or find the school
        let school = await db
            .select()
            .from(schema.schools)
            .where(eq(schema.schools.name, schoolName))
            .limit(1);

        let schoolId: string;
        if (school.length === 0) {
            // Create new school
            const newSchool = await db
                .insert(schema.schools)
                .values({
                    name: schoolName,
                })
                .returning();
            schoolId = newSchool[0].id;
        } else {
            schoolId = school[0].id;
        }

        // Update user with onboarding data
        await db
            .update(schema.users)
            .set({
                name,
                gender: gender as "male" | "female",
                role: role as "admin" | "teacher",
                schoolId,
                updatedAt: new Date(),
            })
            .where(eq(schema.users.email, session.user.email));

        // If user is a teacher, create teacher record
        if (role === "teacher") {
            const user = await db
                .select()
                .from(schema.users)
                .where(eq(schema.users.email, session.user.email))
                .limit(1);

            if (user.length > 0) {
                await db.insert(schema.teachers).values({
                    userId: user[0].id,
                    schoolId,
                    name,
                    role: "regular",
                });
            }
        }

        return {
            success: true,
            message: "הנתונים נשמרו בהצלחה",
        };
    } catch (error) {
        console.error("Error saving onboarding data:", error);
        return {
            success: false,
            message: "אירעה שגיאה בשמירת הנתונים",
        };
    }
}
