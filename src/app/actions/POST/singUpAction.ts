"use server";

import { RegisterRequest, RegisterResponse } from "@/models/types/auth";
import { db, schema } from "@/db";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import msg from "@/resources/messages";

const signUp = async (params: RegisterRequest): Promise<RegisterResponse> => {
    try {
        const { name, email, password, role, gender, school: schoolName } = params;

        if (!name || !email || !password || !role || !gender || !schoolName) {
            return { success: false, message: msg.auth.register.invalid };
        }

        // Check if user with this email already exists
        const existingUser = await db.query.users.findFirst({
            where: eq(schema.users.email, email),
        });

        if (existingUser) {
            return { success: false, message: msg.auth.register.emailInUse };
        }

        const hash = await bcrypt.hash(password, 10);

        // Find school by name
        const existingSchool = await db.query.schools.findFirst({
            where: eq(schema.schools.name, schoolName),
        });

        let schoolId: string;

        // For admin role, create a new school
        if (role === "admin") {
            if (existingSchool) return { success: false, message: msg.auth.register.schoolExist };

            // Create new school
            const [newSchool] = await db
                .insert(schema.schools)
                .values({
                    name: schoolName,
                    type: "Elementary",
                    status: "onboarding",
                })
                .returning({ id: schema.schools.id });

            schoolId = newSchool.id;
        } else {
            // For non-admin roles, add user to existing school
            if (!existingSchool)
                return { success: false, message: msg.auth.register.schoolNotFound };

            schoolId = existingSchool.id;
        }

        // Create new user
        await db.insert(schema.users).values({
            name,
            email,
            password: hash,
            role: role as any,
            gender: gender as any,
            schoolId,
        });

        return { success: true, message: msg.auth.register.success };
    } catch (error) {
        console.error("Sign up error:", error);
        return { success: false, message: msg.auth.register.failed };
    }
};

export default signUp;
