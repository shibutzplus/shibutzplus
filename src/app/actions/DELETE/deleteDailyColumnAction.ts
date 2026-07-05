"use server";

import { ActionResponse } from "@/models/types/actions";
import { DailyScheduleType } from "@/models/types/dailySchedule";
import { checkAuthAndParams } from "@/utils/authUtils";
import messages from "@/resources/messages";
import { db, schema, executeQuery } from "@/db";
import { and, eq, isNull, inArray } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import { dbLog } from "@/services/loggerService";

import { pushSyncUpdateServer } from "@/services/sync/serverSyncService";
import { DAILY_EVENT_COL_DATA_CHANGED, DAILY_TEACHER_COL_DATA_CHANGED } from "@/models/constant/sync";
import { ColumnTypeValues } from "@/models/types/dailySchedule";
import { revalidateTag } from "next/cache";
import { cacheTags } from "@/lib/cacheTags";

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

        let deletedColumnTypes: number[] = [];

        const schedules = await executeQuery(async () => {
            // Handle legacy data where columnId might be NULL (mapped to "undefined" string in state)
            const columnCondition =
                columnId === "undefined" || columnId === "null"
                    ? isNull(schema.dailySchedule.columnId)
                    : eq(schema.dailySchedule.columnId, columnId);

            const deletedRows = await db
                .delete(schema.dailySchedule)
                .where(
                    and(
                        eq(schema.dailySchedule.schoolId, schoolId),
                        eq(schema.dailySchedule.date, date),
                        columnCondition,
                    ),
                )
                .returning({ columnType: schema.dailySchedule.columnType });

            deletedColumnTypes = [...new Set(deletedRows.map(r => r.columnType).filter((t): t is number => t !== null && t !== undefined))];

            const originalTeacher = alias(schema.teachers, "originalTeacher");
            const subTeacher = alias(schema.teachers, "subTeacher");

            const rows = await db
                .select({
                    id: schema.dailySchedule.id,
                    date: schema.dailySchedule.date,
                    day: schema.dailySchedule.day,
                    hour: schema.dailySchedule.hour,
                    columnId: schema.dailySchedule.columnId,
                    position: schema.dailySchedule.position,
                    columnType: schema.dailySchedule.columnType,
                    classIds: schema.dailySchedule.classIds,
                    createdAt: schema.dailySchedule.createdAt,
                    updatedAt: schema.dailySchedule.updatedAt,
                    school: schema.schools,
                    subject: schema.subjects,
                    originalTeacher: originalTeacher,
                    subTeacher: subTeacher,
                })
                .from(schema.dailySchedule)
                .leftJoin(schema.schools, eq(schema.dailySchedule.schoolId, schema.schools.id))
                .leftJoin(schema.subjects, eq(schema.dailySchedule.subjectId, schema.subjects.id))
                .leftJoin(originalTeacher, eq(schema.dailySchedule.originalTeacherId, originalTeacher.id))
                .leftJoin(subTeacher, eq(schema.dailySchedule.subTeacherId, subTeacher.id))
                .where(
                    and(
                        eq(schema.dailySchedule.schoolId, schoolId),
                        eq(schema.dailySchedule.date, date),
                    )
                );

            const s = rows.map((r: any) => ({
                ...r,
                school: r.school && r.school.id ? r.school : null,
                subject: r.subject && r.subject.id ? r.subject : null,
                originalTeacher: r.originalTeacher && r.originalTeacher.id ? r.originalTeacher : null,
                subTeacher: r.subTeacher && r.subTeacher.id ? r.subTeacher : null,
            }));

            const uniqueClassIds = [...new Set(s.flatMap((item) => item.classIds || []))];

            const classesData =
                uniqueClassIds.length > 0
                    ? await db
                        .select()
                        .from(schema.classes)
                        .where(inArray(schema.classes.id, uniqueClassIds))
                    : [];

            const classesMap = new Map(classesData.map((c) => [c.id, c]));

            return s.map((schedule) => ({
                ...schedule,
                classes: (schedule.classIds || []).map((id: string) => classesMap.get(id)).filter(Boolean),
            }));
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
                    originalTeacher: schedule.originalTeacher,
                    columnType: schedule.columnType,
                    subTeacher: schedule.subTeacher,
                    createdAt: schedule.createdAt,
                    updatedAt: schedule.updatedAt,
                    position: schedule.position,
                }) as DailyScheduleType,
        );

        // invalidate cache
        revalidateTag(cacheTags.schoolSchedule(schoolId));
        revalidateTag(cacheTags.dailySchedule(schoolId, date));

        // Push updates based on deleted types
        if (deletedColumnTypes.includes(ColumnTypeValues.missingTeacher) || deletedColumnTypes.includes(ColumnTypeValues.existingTeacher)) {
            void pushSyncUpdateServer(DAILY_TEACHER_COL_DATA_CHANGED, { schoolId, date });
        }
        if (deletedColumnTypes.includes(ColumnTypeValues.event)) {
            void pushSyncUpdateServer(DAILY_EVENT_COL_DATA_CHANGED, { schoolId, date });
        }

        return {
            success: true,
            message: messages.dailySchedule.deleteSuccess,
            dailySchedules,
        };
    } catch (error) {
        dbLog({
            description: `Error deleting daily column: ${error instanceof Error ? error.message : String(error)}`,
            schoolId,
            metadata: { columnId, date }
        });
        return {
            success: false,
            message: messages.dailySchedule.deleteError,
        };
    }
}
