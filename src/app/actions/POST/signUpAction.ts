"use server";

import { RegisterRequest, RegisterResponse } from "@/models/types/auth";
import { db, schema, executeQuery } from "@/db";
import { eq } from "drizzle-orm";
import msg from "@/resources/messages";
import { SchoolLevel } from "@/db/schema";
import bcrypt from "bcryptjs";

const signUp = async (params: RegisterRequest): Promise<RegisterResponse> => {
    try {
        const { name, email, password, systemPassword, role, gender, schoolName, level } = params;

        if (
            !name ||
            !email ||
            !password ||
            !systemPassword ||
            !role ||
            !gender ||
            !schoolName ||
            !level
        ) {
            return { success: false, message: msg.auth.register.invalid };
        }
        if (systemPassword !== process.env.SYSTEM_PASSWORD) {
            return { success: false, message: msg.auth.register.invalid };
        }

        // Check if user with this email already exists
        const existingUser = await executeQuery(async () => {
            return await db.query.users.findFirst({
                where: eq(schema.users.email, email),
            });
        });

        if (existingUser) {
            return { success: false, message: msg.auth.register.emailInUse };
        }

        const hash = await bcrypt.hash(password, 10);

        // Find school by name
        const existingSchool = await executeQuery(async () => {
            return await db.query.schools.findFirst({
                where: eq(schema.schools.name, schoolName),
            });
        });

        let schoolId: string;

        if (existingSchool) {
            schoolId = existingSchool.id;
        } else {
            // Create new school
            schoolId = await executeQuery(async () => {
                const [newSchool] = await db
                    .insert(schema.schools)
                    .values({
                        name: schoolName,
                        type: level,
                        status: "annual",
                        publishDates: [],
                        hoursNum: 10,
                        displaySchedule2Susb: false,
                    })
                    .returning({ id: schema.schools.id });

                const newSchoolId = newSchool.id;

                return newSchoolId;
            });
        }
        await executeQuery(async () => {
            return await db.insert(schema.users).values({
                name,
                email,
                password: hash,
                role: role as any,
                gender: gender as any,
                authType: "google",
                schoolId,
            });
        });

        return { success: true, message: msg.auth.register.success };
    } catch (error) {
        console.error("Sign up error:", error);
        return { success: false, message: msg.auth.register.failed };
    }
};

export default signUp;
