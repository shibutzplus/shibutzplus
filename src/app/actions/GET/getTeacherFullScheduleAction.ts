"use server";

import { DailyScheduleType, GetDailyScheduleResponse } from "@/models/types/dailySchedule";
import { publicAuthAndParams } from "@/utils/authUtils";
import messages from "@/resources/messages";
import { and, eq, or, inArray } from "drizzle-orm";
import { db, schema, executeQuery } from "../../../db";

const getTeacherFullScheduleAction = async (
    teacherId: string,
    date: string,
): Promise<GetDailyScheduleResponse> => {
    try {
        const authError = await publicAuthAndParams({ teacherId, date });
        if (authError) {
            return authError as GetDailyScheduleResponse;
        }

        const result = await executeQuery(async () => {
            // 1. Get Annual Schedule (to show regular schedule graid)
            const dateObj = new Date(date);
            const dayOfWeek = dateObj.getDay() + 1; // 1-7 (Sunday is 1)

            const annualSchedules = await db.query.annualSchedule.findMany({
                where: and(
                    eq(schema.annualSchedule.teacherId, teacherId),
                    eq(schema.annualSchedule.day, dayOfWeek),
                ),
                with: {
                    subject: true,
                    class: true,
                    school: true,
                },
            });

            // 2. Get daily schedule entries
            const dailySchedules = await db.query.dailySchedule.findMany({
                where: and(
                    eq(schema.dailySchedule.date, date),
                    or(
                        eq(schema.dailySchedule.subTeacherId, teacherId),
                        eq(schema.dailySchedule.originalTeacherId, teacherId),
                    ),
                ),
                with: {
                    subject: true,
                    originalTeacher: true,
                    subTeacher: true,
                    school: true,
                },
                orderBy: schema.dailySchedule.hour,
            });

            // Fetch classes array manually since it's an array of IDs
            const allClassIds = new Set<string>();
            dailySchedules.forEach((schedule: any) => {
                if (schedule.classIds && Array.isArray(schedule.classIds)) {
                    schedule.classIds.forEach((id: string) => allClassIds.add(id));
                }
            });

            const classesData =
                allClassIds.size > 0
                    ? await db.query.classes.findMany({
                        where: inArray(schema.classes.id, Array.from(allClassIds)),
                    })
                    : [];

            const classesMap = new Map(classesData.map((c: any) => [c.id, c]));

            const getClasses = (schedule: any) => {
                if (
                    schedule.classIds &&
                    Array.isArray(schedule.classIds) &&
                    schedule.classIds.length > 0
                ) {
                    return schedule.classIds
                        .map((id: string) => classesMap.get(id))
                        .filter(Boolean);
                }
                return [];
            };

            const dailyMap = new Map<number, any>();
            dailySchedules.forEach((ds: any) => dailyMap.set(ds.hour, ds));

            const results: DailyScheduleType[] = [];
            // Process Annual Schedule First
            annualSchedules.forEach((annual: any) => {
                const hour = annual.hour;
                const dailyEntry = dailyMap.get(hour);

                // If there is ANY daily entry for this hour involving this teacher (as original or sub),
                // it overrides the annual schedule entry.
                const showAnnual = !dailyEntry;

                if (showAnnual) {
                    results.push({
                        id: annual.id,
                        date: new Date(date),
                        day: annual.day,
                        hour: annual.hour,
                        columnId: `annual-${annual.id}`,
                        columnType: 1, // existingTeacher
                        school: annual.school,
                        classes: annual.class ? [annual.class] : [],
                        subject: annual.subject,
                        isRegular: true,
                        position: 0,
                        createdAt: annual.createdAt,
                        updatedAt: annual.updatedAt,
                    });
                }
            });

            // Process Daily Schedules
            dailySchedules.forEach((ds: any) => {
                const isSub = ds.subTeacherId === teacherId;
                const isOriginal = ds.originalTeacherId === teacherId;
                const isReplaced = ds.subTeacherId && ds.subTeacherId !== teacherId;

                // Show daily item if:
                // 1. I am the substitute teacher
                // 2. I am the original teacher (even if replaced, so I can see "Replaced by X")
                if (isSub || isOriginal) {
                    results.push({
                        id: ds.id,
                        date: new Date(ds.date),
                        day: ds.day,
                        hour: ds.hour,
                        columnId: ds.columnId || `daily-${ds.id}`,
                        eventTitle: ds.eventTitle || undefined,
                        event: ds.event || undefined,
                        school: ds.school,
                        classes: getClasses(ds),
                        subject: ds.subject || undefined,
                        originalTeacher: ds.originalTeacher || undefined,
                        columnType: ds.columnType || undefined,
                        subTeacher: ds.subTeacher || undefined,
                        position: ds.position || 0,
                        instructions: ds.instructions || undefined,
                        isRegular: (isOriginal && !isReplaced && ds.columnType === 1 && !ds.event),
                        createdAt: ds.createdAt,
                        updatedAt: ds.updatedAt,
                    });
                }
            });

            return results.sort((a: any, b: any) => a.hour - b.hour);
        });

        return {
            success: true,
            message: messages.dailySchedule.success,
            data: result,
        };
    } catch (error) {
        console.error("Error fetching teacher full schedule:", error);
        return {
            success: false,
            message: messages.common.serverError,
        };
    }
};

export default getTeacherFullScheduleAction;
