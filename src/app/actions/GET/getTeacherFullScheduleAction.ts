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
            // Get daily schedule entries where teacher is either subTeacher or issueTeacher
            const dailySchedules = await db.query.dailySchedule.findMany({
                where: and(
                    eq(schema.dailySchedule.date, date),
                    or(
                        eq(schema.dailySchedule.subTeacherId, teacherId),
                        eq(schema.dailySchedule.issueTeacherId, teacherId),
                    ),
                ),
                with: {
                    class: true,
                    subject: true,
                    issueTeacher: true,
                    subTeacher: true,
                    school: true,
                },
                orderBy: schema.dailySchedule.hour,
            });

            // Handle classes array manually since it's an array of IDs
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
                return schedule.class ? [schedule.class] : [];
            };

            // Group by hour to handle conflicts
            const schedulesByHour = new Map<number, any>();

            dailySchedules.forEach((schedule) => {
                const hour = schedule.hour;
                const existing = schedulesByHour.get(hour);

                if (!existing) {
                    // No existing schedule for this hour, add it
                    schedulesByHour.set(hour, schedule);
                } else {
                    // There's a conflict - prioritize subTeacher over issueTeacher
                    if (schedule.subTeacherId === teacherId) {
                        // Current schedule has teacher as subTeacher, use it
                        schedulesByHour.set(hour, schedule);
                    }
                    // If current schedule only has teacher as issueTeacher and existing already exists,
                    // keep the existing one (which could be subTeacher or was added first)
                }
            });

            const results: DailyScheduleType[] = Array.from(schedulesByHour.values())
                .map((schedule) => ({
                    id: schedule.id,
                    date: new Date(schedule.date),
                    day: schedule.day,
                    hour: schedule.hour,
                    columnId: schedule.columnId || `daily-${schedule.id}`,
                    eventTitle: schedule.eventTitle || undefined,
                    event: schedule.event || undefined,
                    school: schedule.school,
                    class: schedule.class || undefined,
                    classes: getClasses(schedule),
                    subject: schedule.subject || undefined,
                    issueTeacher: schedule.issueTeacher || undefined,
                    issueTeacherType: schedule.issueTeacherType || undefined,
                    subTeacher: schedule.subTeacher || undefined,
                    position: schedule.position || 0,
                    instructions: schedule.instructions || undefined,
                    createdAt: schedule.createdAt,
                    updatedAt: schedule.updatedAt,
                }))
                .sort((a, b) => a.hour - b.hour);

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
