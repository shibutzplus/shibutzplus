"use server";

import { publicAuthAndParams } from "@/utils/authUtils";
import messages from "@/resources/messages";
import { db, schema, executeQuery } from "@/db";
import { eq } from "drizzle-orm";
import { GetSchoolSettingsResponse } from "@/models/types/settings";

export async function getSchoolSettingsAction(schoolId: string): Promise<GetSchoolSettingsResponse> {
    try {
        const authError = await publicAuthAndParams({ schoolId });
        if (authError) {
            return authError as GetSchoolSettingsResponse;
        }

        const settings = await executeQuery(async () => {
            return (
                await db.select().from(schema.schoolSettings).where(eq(schema.schoolSettings.schoolId, schoolId))
            )[0];
        });

        if (!settings) {
            return {
                success: false,
                message: "Settings not found",
            };
        }

        return {
            success: true,
            message: "Settings fetched successfully",
            data: settings,
        };
    } catch (error) {
        console.error("Error fetching school settings:", error);
        return {
            success: false,
            message: messages.common.serverError,
        };
    }
}
