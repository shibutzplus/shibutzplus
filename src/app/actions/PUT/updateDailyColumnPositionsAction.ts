"use server";
//
// Used for batch updating column positions during rebalancing (drag & drop, insertion conflicts).
//
import { db } from "@/db";
import { dailySchedule } from "@/db/schema/daily-schedule";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";

type ColumnPositionUpdate = {
    columnId: string;
    position: number;
};

export async function updateDailyColumnPositionsAction(
    schoolId: string,
    date: string,
    updates: ColumnPositionUpdate[]
) {
    if (!updates.length) return { success: true };

    try {
        // Neon HTTP driver doesn't support transactions, so we use Promise.all
        await Promise.all(
            updates.map((update) =>
                db
                    .update(dailySchedule)
                    .set({ position: update.position })
                    .where(
                        and(
                            eq(dailySchedule.schoolId, schoolId),
                            eq(dailySchedule.columnId, update.columnId),
                            eq(dailySchedule.date, date),
                        ),
                    ),
            ),
        );

        revalidatePath("/daily-schedule");
        return { success: true, message: "Positions updated successfully" };
    } catch (error) {
        console.error("Error updating column positions:", error);
        return { success: false, message: "Failed to update positions" };
    }
}
