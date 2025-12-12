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

        const existingSettings = await db
            .select()
            .from(schema.schoolSettings)
            .where(eq(schema.schoolSettings.schoolId, schoolId))
            .limit(1)
            .then((res) => res[0]);

        if (existingSettings) {
            await db
                .update(schema.schoolSettings)
                .set({
                    hoursNum,
                    displaySchedule2Susb,
                })
                .where(eq(schema.schoolSettings.id, existingSettings.id));
        } else {
            await db.insert(schema.schoolSettings).values({
                hoursNum,
                displaySchedule2Susb,
                schoolId,
            });
        }

        revalidatePath("/");

        revalidatePath("/");

        const updatedSettings: SchoolSettingsType = existingSettings
            ? { ...existingSettings, hoursNum, displaySchedule2Susb }
            : { id: 0, schoolId, hoursNum, displaySchedule2Susb }; // ID 0 is temp if inserted, but usually we'd fetch or use RETURNING

        // Better to fetch fresh if we want ID, but for now just returning params is enough for optimstic/local update
        // Or if we want perfect sync we can return what we wrote.
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
