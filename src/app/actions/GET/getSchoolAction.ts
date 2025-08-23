"use server";

import { GetSchoolResponse } from "@/models/types/school";
import { checkAuthAndParams } from "@/utils/authUtils";
import messages from "@/resources/messages";
import { db, schema } from "@/db";
import { eq } from "drizzle-orm";

export async function getSchoolAction(schoolId: string): Promise<GetSchoolResponse> {
    try {
        const authError = await checkAuthAndParams({ schoolId });
        if (authError) {
            return authError as GetSchoolResponse;
        }

        const school = (
            await db.select().from(schema.schools).where(eq(schema.schools.id, schoolId))
        )[0];

        if (!school) {
            return {
                success: false,
                message: messages.school.notFound,
            };
        }

        return {
            success: true,
            message: messages.school.success,
            data: school,
        };
    } catch (error) {
        console.error("Error fetching school:", error);
        return {
            success: false,
            message: messages.common.serverError,
        };
    }
}
