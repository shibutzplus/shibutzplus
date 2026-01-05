"use server";

import { ActionResponse } from "@/models/types/actions";
import { DailyScheduleType } from "@/models/types/dailySchedule";
import { checkAuthAndParams } from "@/utils/authUtils";
import messages from "@/resources/messages";
import { db, schema, executeQuery } from "@/db";
import { and, eq, isNull, inArray } from "drizzle-orm";

export async function deleteDailyColumnAction(
    schoolId: string,
    columnId: string,
    date: string,
): Promise<ActionResponse & { dailySchedules?: DailyScheduleType[] }> {
    try {
        const authError = await checkAuthAndParams({ schoolId, columnId, date });
        if (authError) {
            return authError as ActionResponse;
        }

        const schedules = await executeQuery(async () => {
            // Handle legacy data where columnId might be NULL (mapped to "undefined" string in state)
            const columnCondition = (columnId === "undefined" || columnId === "null")
                ? isNull(schema.dailySchedule.columnId)
                : eq(schema.dailySchedule.columnId, columnId);

            await db
                .delete(schema.dailySchedule)
                .where(
                    and(
                        eq(schema.dailySchedule.schoolId, schoolId),
                        eq(schema.dailySchedule.date, date),
                        columnCondition,
                    ),
                );

            const s = await db.query.dailySchedule.findMany({
                where: and(
                    eq(schema.dailySchedule.schoolId, schoolId),
                    eq(schema.dailySchedule.date, date),
                ),
                with: {
                    school: true,
                    subject: true,
                    issueTeacher: true,
                    subTeacher: true,
                },
            });

            // Handle classes array manually
            const allClassIds = new Set<string>();
            s.forEach((schedule: any) => {
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

            return s.map((schedule: any) => {
                let classes = [];
                if (schedule.classIds && Array.isArray(schedule.classIds)) {
                    classes = schedule.classIds
                        .map((id: string) => classesMap.get(id))
                        .filter(Boolean);
                }

                return {
                    ...schedule,
                    classes,
                };
            });
        });

        const dailySchedules = schedules.map(
            (schedule) =>
                ({
                    id: schedule.id,
                    date: new Date(schedule.date),
                    day: schedule.day,
                    hour: schedule.hour,
                    columnId: schedule.columnId,
                    school: schedule.school,
                    classes: schedule.classes,
                    subject: schedule.subject,
                    issueTeacher: schedule.issueTeacher,
                    issueTeacherType: schedule.issueTeacherType,
                    subTeacher: schedule.subTeacher,
                    createdAt: schedule.createdAt,
                    updatedAt: schedule.updatedAt,
                    position: schedule.position,
                }) as DailyScheduleType,
        );

        return {
            success: true,
            message: messages.dailySchedule.deleteSuccess,
            dailySchedules,
        };
    } catch (error) {
        console.error("Error deleting daily schedule column:", error, { schoolId, columnId, date });
        return {
            success: false,
            message: messages.dailySchedule.deleteError,
        };
    }
}
