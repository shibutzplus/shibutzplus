"use server";

/**
 * System Recommendation Logic (used by Magic Subs scoring engine):
 *
 * Analyzes historical substitution data to suggest the most relevant substitute teachers.
 * Queries the 'history' table for a specific school and day of the week (e.g., all past Sundays).
 *
 * Logic:
 * 1. Find all past substitutions for the requested day in the current school year.
 * 2. Group by Hour and the Original Teacher who was replaced.
 * 3. Count how many times each Substitute replaced that Original Teacher in that hour.
 * 4. Filter for substitutes who have done this at least MIN_SUBSTITUTIONS_THRESHOLD times.
 * 5. Sort by frequency (most frequent first) and return the top 5.
 *
 * The result feeds into the Magic Subs scoring engine as historical pattern bonuses.
 */

import { db } from "@/db";
import { history } from "@/db/schema";
import { and, eq, gte, isNotNull, sql } from "drizzle-orm";
import { getSchoolYearStartDate } from "@/utils/time";
import { dbLog } from "@/services/loggerService";

const MIN_SUBSTITUTIONS_THRESHOLD = 1;

export type RecommendationCandidate = { name: string; count: number };
export type SystemRecommendationsMap = Record<string, Record<string, RecommendationCandidate[]>>;

export async function getSystemRecommendationsAction(
    schoolId: string,
    day: number,
    targetDate?: string,
) {
    try {
        if (!schoolId) {
            return {
                success: false,
                message: "School ID is required",
            };
        }

        const schoolYearStart = getSchoolYearStartDate(targetDate);

        // Query history to find frequent substitutes in the current school year
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
                    gte(history.date, schoolYearStart),
                    isNotNull(history.originalTeacher),
                    isNotNull(history.subTeacher),
                ),
            )
            .groupBy(history.hour, history.originalTeacher, history.subTeacher)
            .having(sql`count(*) >= ${MIN_SUBSTITUTIONS_THRESHOLD}`);

        // Group results directly into recommendations (single pass)
        const recommendations: SystemRecommendationsMap = {};

        for (const row of results) {
            if (!row.originalTeacher || !row.subTeacher) continue;
            const hourStr = row.hour.toString();
            if (!recommendations[hourStr]) recommendations[hourStr] = {};
            if (!recommendations[hourStr][row.originalTeacher]) recommendations[hourStr][row.originalTeacher] = [];
            recommendations[hourStr][row.originalTeacher].push({ name: row.subTeacher, count: row.count });
        }

        // Sort each slot's candidates by frequency and keep top 5
        for (const hourStr of Object.keys(recommendations)) {
            for (const teacher of Object.keys(recommendations[hourStr])) {
                recommendations[hourStr][teacher].sort((a, b) => b.count - a.count);
                recommendations[hourStr][teacher] = recommendations[hourStr][teacher].slice(0, 5);
            }
        }

        return {
            success: true,
            data: recommendations,
        };

    } catch (error) {
        dbLog({
            description: `Error fetching system recommendations: ${error instanceof Error ? error.message : String(error)}`,
            schoolId,
            metadata: { day, targetDate },
        });
        return {
            success: false,
            message: "Failed to fetch recommendations",
        };
    }
}
