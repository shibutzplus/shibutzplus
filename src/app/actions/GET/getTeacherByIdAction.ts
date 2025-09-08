"use server";

import { db, executeQuery } from "@/db";
import { teachers } from "@/db/schema/teachers";
import { eq } from "drizzle-orm";
import messages from "@/resources/messages";
import { publicAuthAndParams } from "@/utils/authUtils";
import { ActionResponse } from "@/models/types/actions";
import { GetTeacherByIdResponse } from "@/models/types/dailySchedule";

export async function getTeacherByIdAction(teacherId: string): Promise<GetTeacherByIdResponse> {
    try {
        const authError = await publicAuthAndParams({ teacherId });
        if (authError) {
            return authError as ActionResponse;
        }

        if (!teacherId) {
            return {
                success: false,
                message: messages.teachers.invalid,
            };
        }
        const teacher = await executeQuery(async () => {
            return await db.query.teachers.findFirst({
                where: eq(teachers.id, teacherId),
            });
        });
        if (!teacher) {
            return {
                success: false,
                message: messages.teachers.error,
            };
        }
        return {
            success: true,
            message: messages.teachers.success,
            data: teacher,
        };
    } catch (error) {
        console.error("Error fetching teacher by id:", error);
        return {
            success: false,
            message: messages.common.serverError,
        };
    }
}
