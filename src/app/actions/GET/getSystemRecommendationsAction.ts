"use server";

/**
 * System Recommendation Logic:
 * 
 * This action analyzes the historical substitution data to suggest the most relevant substitute teachers.
 * It queries the 'history' table for a specific school and day of the week (e.g., all past Sundays).
 * 
 * The logic is as follows:
 * 1. Find all past substitutions for the requested day.
 * 2. Group them by Hour and the Original Teacher who was replaced.
 * 3. Count how many times each Substitute Teacher replaced that Original Teacher in that specific hour.
 * 4. Filter for substitutes who have done this at least MIN_SUBSTITUTIONS_THRESHOLD times.
 * 5. Sort the candidates by frequency (most frequent first) and pick the top 3.
 * 
 * The result is a list of recommended substitutes for each slot, based on past behavior.
 */

import { db } from "@/db";
import { history } from "@/db/schema";
import { and, eq, isNotNull, sql } from "drizzle-orm";

const MIN_SUBSTITUTIONS_THRESHOLD = 1;

export async function getSystemRecommendationsAction(
    schoolId: string,
    day: number,
) {
    try {
        if (!schoolId) {
            return {
                success: false,
                message: "School ID is required",
            };
        }

        // Query history to find frequent substitutes
        // Group by hour, originalTeacher, subTeacher
        // Count occurrences
        const results = await db
            .select({
                hour: history.hour,
                originalTeacher: history.originalTeacher,
                subTeacher: history.subTeacher,
                count: sql<number>`count(*)`.mapWith(Number),
            })
            .from(history)
            .where(
                and(
                    eq(history.schoolId, schoolId),
                    eq(history.day, day),
                    isNotNull(history.originalTeacher),
                    isNotNull(history.subTeacher),
                ),
            )
            .groupBy(history.hour, history.originalTeacher, history.subTeacher)
            .having(sql`count(*) >= ${MIN_SUBSTITUTIONS_THRESHOLD}`);

        // Process results in memory to get top 2 per slot
        const recommendations: Record<string, Record<string, string[]>> = {};

        // reorganize the data structure for easier processing
        // Map<Hour, Map<OriginalTeacher, Array<{sub, count}>>>
        const tempMap = new Map<number, Map<string, Array<{ sub: string; count: number }>>>();

        for (const row of results) {
            if (!row.originalTeacher || !row.subTeacher) continue;

            const hour = row.hour;
            const original = row.originalTeacher;
            const sub = row.subTeacher;
            const count = row.count;

            if (!tempMap.has(hour)) {
                tempMap.set(hour, new Map());
            }
            const hourMap = tempMap.get(hour)!;

            if (!hourMap.has(original)) {
                hourMap.set(original, []);
            }
            hourMap.get(original)!.push({ sub, count });
        }

        // sort and select top X
        tempMap.forEach((hourMap, hour) => {
            const hourStr = hour.toString();
            recommendations[hourStr] = {};

            hourMap.forEach((candidates, originalTeacher) => {
                // Sort by count descending
                candidates.sort((a, b) => b.count - a.count);

                // Take top 3 and map to names
                recommendations[hourStr][originalTeacher] = candidates
                    .slice(0, 3)
                    .map(c => c.sub);
            });
        });

        return {
            success: true,
            data: recommendations,
        };

    } catch (_) {

        return {
            success: false,
            message: "Failed to fetch recommendations",
        };
    }
}
