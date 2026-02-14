"use server";

import { db, schema } from "@/db";
import { eq } from "drizzle-orm";
import { revalidatePath, revalidateTag } from "next/cache";
import { cacheTags } from "@/lib/cacheTags";
import { ActionResponse } from "@/models/types/actions";
import { SchoolSettingsType } from "@/models/types/settings";
import { checkIsNotGuest } from "@/utils/authUtils";
import { dbLog } from "@/services/loggerService";

export type UpdateSettingsResponse = ActionResponse & {
    data?: SchoolSettingsType;
};

export type UpdateSettingsParams = {
    fromHour: number;
    toHour: number;
    displaySchedule2Susb: boolean;
    schoolId: string;
};

export async function updateSettingsAction(
    params: UpdateSettingsParams,
): Promise<UpdateSettingsResponse> {
    try {
        const guestError = await checkIsNotGuest();
        if (guestError) {
            return guestError as ActionResponse;
        }

        const { fromHour, toHour, displaySchedule2Susb, schoolId } = params;

        await db
            .update(schema.schools)
            .set({
                fromHour,
                toHour,
                displaySchedule2Susb,
            })
            .where(eq(schema.schools.id, schoolId));

        revalidatePath("/");
        revalidateTag(cacheTags.schoolSchedule(schoolId));

        // Since we are updating schools, we return the params as the updated state
        const updatedSettings: SchoolSettingsType = {
            id: 0, // Placeholder, not used practically in new flow
            schoolId,
            fromHour,
            toHour,
            displaySchedule2Susb,
        };

        return {
            success: true,
            message: "ההגדרות נשמרו בהצלחה",
            data: updatedSettings,
        };
    } catch (error) {
        dbLog({
            description: `Error updating system settings: ${error instanceof Error ? error.message : String(error)}`,
            schoolId: params.schoolId
        });
        return { success: false, message: (error as Error).message };
    }
}
