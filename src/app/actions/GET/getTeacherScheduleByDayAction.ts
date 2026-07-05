"use server";

import { checkAuthAndParams } from "@/utils/authUtils";
import messages from "@/resources/messages";
import { db, schema, executeQuery } from "@/db";
import { and, asc, eq } from "drizzle-orm";
import { dbLog } from "@/services/loggerService";
import {
    ColumnTypeValues,
    GetTeacherScheduleResponse,
    TeacherHourlyScheduleItem,
} from "@/models/types/dailySchedule";

export async function getTeacherScheduleByDayAction(
    schoolId: string,
    day: number,
    teacherId: string,
): Promise<GetTeacherScheduleResponse> {
    try {
        const authError = await checkAuthAndParams({ schoolId, day, teacherId });
        if (authError) {
            return authError as GetTeacherScheduleResponse;
        }
        const teacherSchedule = await executeQuery(async () => {
            const rows = await db
                .select({
                    id: schema.annualSchedule.id,
                    day: schema.annualSchedule.day,
                    hour: schema.annualSchedule.hour,
                    schoolId: schema.annualSchedule.schoolId,
                    class: schema.classes,
                    subject: schema.subjects,
                    teacher: schema.teachers,
                })
                .from(schema.annualSchedule)
                .leftJoin(schema.classes, eq(schema.annualSchedule.classId, schema.classes.id))
                .leftJoin(schema.subjects, eq(schema.annualSchedule.subjectId, schema.subjects.id))
                .leftJoin(schema.teachers, eq(schema.annualSchedule.teacherId, schema.teachers.id))
                .where(and(
                    eq(schema.annualSchedule.teacherId, teacherId),
                    eq(schema.annualSchedule.day, day),
                ))
                .orderBy(asc(schema.annualSchedule.hour));

            const schedules = rows.map((r: any) => ({
                ...r,
                class: r.class && r.class.id ? r.class : null,
                subject: r.subject && r.subject.id ? r.subject : null,
                teacher: r.teacher && r.teacher.id ? r.teacher : null,
            }));

            if (!schedules || schedules.length === 0) {
                return [];
            }

            const groupedSchedules = schedules.reduce<
                Record<number, TeacherHourlyScheduleItem>
            >((acc, schedule) => {
                const hour = schedule.hour;
                if (!acc[hour]) {
                    acc[hour] = {
                        hour: schedule.hour,
                        classes: [],
                        subject: schedule.subject,
                        headerCol: {
                            headerTeacher: schedule.teacher,
                            type: ColumnTypeValues.existingTeacher,
                        },
                    };
                }

                if (schedule.class) {
                    const classExists = acc[hour].classes.some(c => c.id === schedule.class.id);
                    if (!classExists) {
                        acc[hour].classes.push(schedule.class);
                    }
                }

                return acc;
            }, {});

            return Object.values(groupedSchedules).sort((a, b) => a.hour - b.hour);
        });

        if (!teacherSchedule || teacherSchedule.length === 0) {
            return {
                success: true,
                message: messages.dailySchedule.success,
                data: [],
            };
        }

        return {
            success: true,
            message: messages.dailySchedule.success,
            data: teacherSchedule,
        };
    } catch (error) {
        dbLog({
            description: `Error fetching teacher schedule: ${error instanceof Error ? error.message : String(error)}`,
            schoolId,
            user: teacherId,
            metadata: { day }
        });
        return {
            success: false,
            message: messages.common.serverError,
        };
    }
}
