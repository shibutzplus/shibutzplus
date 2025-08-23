"use server";

import { RegisterRequest, RegisterResponse } from "@/models/types/auth";
import { db, schema } from "@/db";
import { eq } from "drizzle-orm";
import msg from "@/resources/messages";
import { initClasses, initSubjects } from "@/resources/levelsOptions";
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

        if (existingSchool) {
            schoolId = existingSchool.id;
        } else {
            // Create new school
            const [newSchool] = await db
                .insert(schema.schools)
                .values({
                    name: schoolName,
                    type: level,
                    status: "annual",
                    publishDates: [],
                })
                .returning({ id: schema.schools.id });

            schoolId = newSchool.id;

            // Create classes and subjects
            const classes = initClasses(level as SchoolLevel);
            const subjects = initSubjects(level as SchoolLevel);

            for (const className of classes) {
                await db.insert(schema.classes).values({ name: className, schoolId }).returning();
            }

            for (const subject of subjects) {
                await db.insert(schema.subjects).values({
                    name: subject,
                    schoolId,
                });
            }
        }
        await db.insert(schema.users).values({
            name,
            email,
            password: hash,
            role: role as any,
            gender: gender as any,
            authType: "google",
            schoolId,
        });

        return { success: true, message: msg.auth.register.success };
    } catch (error) {
        console.error("Sign up error:", error);
        return { success: false, message: msg.auth.register.failed };
    }
};

export default signUp;
