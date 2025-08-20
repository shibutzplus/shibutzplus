"use server";

import { db, schema } from "@/db";
import { users } from "@/db/schema/users";
import { schools } from "@/db/schema/schools";
import { eq } from "drizzle-orm";
import { FullUser } from "@/models/types/onboarding";
import { SchoolAgeGroup } from "@/models/types/school";
import { ActionResponse } from "@/models/types/actions";
import messages from "@/resources/messages";
import { initClasses, initSubjects } from "@/resources/levelsOptions";

export interface OnboardingNewUserResponse extends ActionResponse {
    status?: "onboarding-annual" | "onboarding-daily";
}

export async function onboardingNewUserAction(
    fullUser: FullUser,
): Promise<OnboardingNewUserResponse> {
    try {
        // Find the user by name (or by email if available in your context)
        const existingUser = await db.query.users.findFirst({
            where: eq(users.name, fullUser.name),
        });
        if (!existingUser) {
            return { success: false, message: messages.auth.register.invalid };
        }

        // Check if school exists
        const existingSchool = await db.query.schools.findFirst({
            where: eq(schools.name, fullUser.schoolName),
        });

        let schoolId: string;
        let status: "onboarding-annual" | "onboarding-daily";
        let message: string;

        if (existingSchool) {
            // Assign user to existing school
            schoolId = existingSchool.id;
            status = "onboarding-daily";
            message = messages.auth.register.success;
        } else {
            // Create new school
            // Map onboarding level to SchoolAgeGroup type
            const levelMap: Record<string, SchoolAgeGroup> = {
                elementary: "Elementary",
                middle: "Middle",
                high: "High",
            };
            const schoolType = levelMap[fullUser.level] || "Elementary";
            const [newSchool] = await db
                .insert(schools)
                .values({
                    name: fullUser.schoolName,
                    type: schoolType,
                    status: "onboarding-annual",
                    publishDates: [],
                })
                .returning({ id: schools.id });
            schoolId = newSchool.id;
            status = "onboarding-annual";
            message = messages.auth.register.success;
        }

        // Update user with onboarding info and assigned school
        await db
            .update(users)
            .set({
                name: fullUser.name,
                gender: fullUser.gender,
                role: fullUser.role,
                schoolId,
            })
            .where(eq(users.id, existingUser.id));

        const classes = initClasses(fullUser.level as SchoolAgeGroup);
        const subjects = initSubjects(fullUser.level as SchoolAgeGroup);

        for (const className of classes) {
            await db.insert(schema.classes).values({ name: className, schoolId }).returning();
        }

        for (const subject of subjects) {
            await db.insert(schema.subjects).values({
                name: subject,
                schoolId,
            });
        }

        return {
            success: true,
            message,
            status,
        };
    } catch (error) {
        console.error("Error in onboardingNewUserAction:", error);
        return {
            success: false,
            message: messages.auth.register.failed,
        };
    }
}
