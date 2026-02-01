"use server";
//
// Used for batch updating column positions during rebalancing (drag & drop, insertion conflicts).
//
import { db } from "@/db";
import { dailySchedule } from "@/db/schema/daily-schedule";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { dbLog } from "@/services/loggerService";
import { pushSyncUpdateServer } from "@/services/sync/serverSyncService";
import { DAILY_EVENT_COL_DATA_CHANGED } from "@/models/constant/sync";

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

        void pushSyncUpdateServer(DAILY_EVENT_COL_DATA_CHANGED, { schoolId, date });

        revalidatePath("/daily-schedule");
        return { success: true, message: "Positions updated successfully" };
    } catch (error) {
        dbLog({
            description: `Error updating column positions: ${error instanceof Error ? error.message : String(error)}`,
            schoolId,
            metadata: { date }
        });
        return { success: false, message: "Failed to update positions" };
    }
}
