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
            // Get daily schedule entries where teacher is either subTeacher or originalTeacher
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

            const results: DailyScheduleType[] = dailySchedules
                .map((schedule: any) => ({
                    id: schedule.id,
                    date: new Date(schedule.date),
                    dayInt: schedule.dayInt,
                    hour: schedule.hour,
                    columnId: schedule.columnId || `daily-${schedule.id}`,
                    eventTitle: schedule.eventTitle || undefined,
                    event: schedule.event || undefined,
                    school: schedule.school,
                    classes: getClasses(schedule),
                    subject: schedule.subject || undefined,
                    originalTeacher: schedule.originalTeacher || undefined,
                    columnType: schedule.columnType || undefined,
                    subTeacher: schedule.subTeacher || undefined,
                    position: schedule.position || 0,
                    instructions: schedule.instructions || undefined,
                    createdAt: schedule.createdAt,
                    updatedAt: schedule.updatedAt,
                }))
                .sort((a: any, b: any) => a.hour - b.hour);

            return results;
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
