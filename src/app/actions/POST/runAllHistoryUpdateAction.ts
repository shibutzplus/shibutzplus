"use server";

//
//  Temporary Migration Process which will run once when feature is released
//
import { db } from "@/db";
import { dailySchedule } from "@/db/schema";
import { processHistoryUpdate } from "@/services/history/updateHistory";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import messages from "@/resources/messages";
import { asc, eq, lte } from "drizzle-orm";

function incrementDate(dateStr: string): string {
    const date = new Date(dateStr);
    date.setDate(date.getDate() + 1);
    return date.toISOString().split('T')[0];
}

export async function runAllHistoryUpdateAction() {
    try {
        const session = await getServerSession(authOptions);

        if (!session) {
            return {
                success: false,
                message: messages.auth.unauthorized,
                logs: []
            };
        }

        // 1. Find the first date in dailySchedule
        const result = await db
            .select({ date: dailySchedule.date })
            .from(dailySchedule)
            .orderBy(asc(dailySchedule.date))
            .limit(1);

        if (result.length === 0) {
            return {
                success: true,
                message: "No daily schedules found.",
                logs: ["No data to process."],
                stats: { schoolsUpdated: 0, recordsCount: 0 }
            };
        }

        const startDate = result[0].date;
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        const endDate = yesterday.toISOString().split('T')[0];

        if (startDate > endDate) {
            return {
                success: true,
                message: "Start date is after yesterday.",
                logs: [`Start date ${startDate} is after end date ${endDate}.`],
                stats: { schoolsUpdated: 0, recordsCount: 0 }
            };
        }

        let currentDate = startDate;
        const allLogs: string[] = [];
        let totalSchoolsUpdated = 0;
        let totalRecordsCount = 0;

        allLogs.push(`Starting full backfill from ${startDate} to ${endDate}`);

        while (currentDate <= endDate) {
            allLogs.push(`Processing date: ${currentDate}`);
            const updateResult = await processHistoryUpdate(currentDate, true);

            if (updateResult.success) {
                totalSchoolsUpdated += updateResult.schoolsUpdated;
                totalRecordsCount += updateResult.recordsCount;
                allLogs.push(...updateResult.logs);
            } else {
                allLogs.push(`Failed for ${currentDate}: ${updateResult.logs[0]}`); // Basic error logging
            }

            currentDate = incrementDate(currentDate);
        }

        return {
            success: true,
            message: "Full history backfill completed.",
            logs: allLogs,
            stats: {
                schoolsUpdated: totalSchoolsUpdated,
                recordsCount: totalRecordsCount
            }
        };

    } catch (error) {
        console.error("Error running full history update:", error);
        return {
            success: false,
            message: messages.common.serverError,
            logs: [String(error)]
        };
    }
}
