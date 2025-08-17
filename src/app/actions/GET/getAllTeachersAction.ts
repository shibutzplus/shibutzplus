"use server";

import { GetTeachersResponse } from "@/models/types/teachers";
import messages from "@/resources/messages";
import { db, schema } from "@/db";
import { unstable_cache } from "next/cache";

const getAllTeachersCached = unstable_cache(
    async () => {
        const teachers = await db
            .select({
                id: schema.teachers.id,
                name: schema.teachers.name,
                role: schema.teachers.role,
                schoolId: schema.teachers.schoolId,
            })
            .from(schema.teachers);

        return teachers;
    },
    ["all-teachers"],
    {
        tags: ["teachers-data"],
        revalidate: 3600, // 1 hour
    }
);

export async function getAllTeachersAction(): Promise<GetTeachersResponse> {
    try {
        const teachers = await getAllTeachersCached();

        if (!teachers || teachers.length === 0) {
            return {
                success: false,
                message: messages.teachers.retrieveError,
            };
        }

        return {
            success: true,
            message: messages.teachers.retrieveSuccess,
            data: teachers,
        };
    } catch (error) {
        console.error("Error fetching all teachers:", error);
        return {
            success: false,
            message: messages.teachers.retrieveError,
        };
    }
}
