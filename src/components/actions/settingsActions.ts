"use server";

import { db } from "@/db";
import { schoolSettings } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export type UpdateSettingsParams = {
    hoursNum: number;
    displaySchedule2Susb: boolean;
    schoolId: string;
};

export async function updateSettingsAction(params: UpdateSettingsParams) {
    try {
        const { hoursNum, displaySchedule2Susb, schoolId } = params;

        const existingSettings = await db.query.schoolSettings.findFirst({
            where: eq(schoolSettings.schoolId, schoolId),
        });

        if (existingSettings) {
            await db.update(schoolSettings)
                .set({
                    hoursNum,
                    displaySchedule2Susb,
                })
                .where(eq(schoolSettings.id, existingSettings.id));
        } else {
            await db.insert(schoolSettings).values({
                hoursNum,
                displaySchedule2Susb,
                schoolId,
            });
        }

        revalidatePath("/");

        return { success: true };
    } catch (error) {
        console.error("Error updating system settings:", error);
        return { success: false, error: "Failed to update settings" };
    }
}
