"use server";

import { DailyScheduleType, GetDailyScheduleResponse } from "@/models/types/dailySchedule";
import { checkAuthAndParams, publicAuthAndParams } from "@/utils/authUtils";
import messages from "@/resources/messages";
import { and, eq, inArray } from "drizzle-orm";
import { db, schema, executeQuery } from "../../../db";

export async function getDailyScheduleAction(
    schoolId: string,
    date: string,
    options: { isPrivate: boolean } = { isPrivate: true },
): Promise<GetDailyScheduleResponse> {
    try {
        let authError;
        if (options.isPrivate) {
            authError = await checkAuthAndParams({ schoolId, date });
        } else {
            authError = await publicAuthAndParams({ schoolId, date });
        }
        if (authError) return authError as GetDailyScheduleResponse;

        // For public access, verify the date is actually published!
        if (!options.isPrivate) {
            const school = await executeQuery(async () => {
                return await db.query.schools.findFirst({
                    where: eq(schema.schools.id, schoolId),
                    columns: {
                        publishDates: true,
                    },
                });
            });

            if (!school?.publishDates?.includes(date)) {
                return {
                    success: false,
                    message: messages.dailySchedule.notPublished,
                };
            }
        }

        const dailySchedule = await executeQuery(async () => {
            const schedules = await db.query.dailySchedule.findMany({
                where: and(
                    eq(schema.dailySchedule.schoolId, schoolId),
                    eq(schema.dailySchedule.date, date),
                ),
                with: {
                    subject: true,
                    originalTeacher: true,
                    subTeacher: true,
                    school: true,
                },
            });

            // TODO: ugly
            // Fetch classes array manually since it's an array of IDs
            const allClassIds = new Set<string>();
            schedules.forEach((schedule: any) => {
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

            return schedules.map(
                (schedule: any) =>
                    ({
                        id: schedule.id,
                        date: schedule.date,
                        dayInt: schedule.dayInt,
                        hour: schedule.hour,
                        columnId: schedule.columnId,
                        eventTitle: schedule.eventTitle,
                        event: schedule.event,
                        school: schedule.school,
                        classes: getClasses(schedule),
                        subject: schedule.subject,
                        originalTeacher: schedule.originalTeacher,
                        columnType: schedule.columnType,
                        subTeacher: schedule.subTeacher,
                        position: schedule.position,
                        createdAt: schedule.createdAt,
                        updatedAt: schedule.updatedAt,
                    }) as DailyScheduleType,
            );
        });

        return {
            success: true,
            message: messages.dailySchedule.success,
            data: dailySchedule,
        };
    } catch (error) {
        console.error("Error fetching daily schedule:", error);
        return {
            success: false,
            message: messages.common.serverError,
        };
    }
}
