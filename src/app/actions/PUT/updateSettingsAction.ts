"use server";

import { db, schema } from "@/db";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { ActionResponse } from "@/models/types/actions";
import { SchoolSettingsType } from "@/models/types/settings";

export type UpdateSettingsResponse = ActionResponse & {
    data?: SchoolSettingsType;
};

export type UpdateSettingsParams = {
    hoursNum: number;
    displaySchedule2Susb: boolean;
    schoolId: string;
};

export async function updateSettingsAction(
    params: UpdateSettingsParams
): Promise<UpdateSettingsResponse> {
    try {
        const { hoursNum, displaySchedule2Susb, schoolId } = params;

        await db
            .update(schema.schools)
            .set({
                hoursNum,
                displaySchedule2Susb,
            })
            .where(eq(schema.schools.id, schoolId));

        revalidatePath("/");

        // Since we are updating schools, we return the params as the updated state
        const updatedSettings: SchoolSettingsType = {
            id: 0, // Placeholder, not used practically in new flow
            schoolId,
            hoursNum,
            displaySchedule2Susb
        };

        return {
            success: true,
            message: "ההגדרות נשמרו בהצלחה",
            data: updatedSettings,
        };
    } catch (error) {
        console.error("Error updating system settings:", error);
        return { success: false, message: (error as Error).message };
    }
}
