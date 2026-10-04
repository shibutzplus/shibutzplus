"use server";

import { db } from "@/db";
import { annualSchedule, teachers, classes, subjects } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export interface TeacherExistingScheduleItem {
    day: number;
    hour: number;
    className: string;
    subjectName: string;
}

export interface TeacherExistingScheduleResponse {
    hasSchedule: boolean;
    schedule: TeacherExistingScheduleItem[];
}

export async function getTeacherExistingScheduleAction(
    teacherName: string,
    schoolId: string
): Promise<TeacherExistingScheduleResponse> {
    try {
        const [teacher] = await db
            .select({ id: teachers.id })
            .from(teachers)
            .where(and(
                eq(teachers.name, teacherName),
                eq(teachers.schoolId, schoolId)
            ))
            .limit(1);

        if (!teacher) {
            return { hasSchedule: false, schedule: [] };
        }

        const rows = await db
            .select({
                day: annualSchedule.day,
                hour: annualSchedule.hour,
                className: classes.name,
                subjectName: subjects.name,
            })
            .from(annualSchedule)
            .leftJoin(classes, eq(annualSchedule.classId, classes.id))
            .leftJoin(subjects, eq(annualSchedule.subjectId, subjects.id))
            .where(and(
                eq(annualSchedule.teacherId, teacher.id),
                eq(annualSchedule.schoolId, schoolId)
            ));

        return {
            hasSchedule: rows.length > 0,
            schedule: rows.map(r => ({
                day: r.day,
                hour: r.hour,
                className: r.className || "",
                subjectName: r.subjectName || "",
            }))
        };
    } catch {
        return { hasSchedule: false, schedule: [] };
    }
}

export async function getSchoolExistingSchedulesAction(
    schoolId: string
): Promise<Record<string, TeacherExistingScheduleItem[]>> {
    try {
        const rows = await db
            .select({
                teacherName: teachers.name,
                day: annualSchedule.day,
                hour: annualSchedule.hour,
                className: classes.name,
                subjectName: subjects.name,
            })
            .from(annualSchedule)
            .innerJoin(teachers, eq(annualSchedule.teacherId, teachers.id))
            .leftJoin(classes, eq(annualSchedule.classId, classes.id))
            .leftJoin(subjects, eq(annualSchedule.subjectId, subjects.id))
            .where(eq(annualSchedule.schoolId, schoolId));

        const result: Record<string, TeacherExistingScheduleItem[]> = {};
        for (const r of rows) {
            if (!r.teacherName) continue;
            if (!result[r.teacherName]) {
                result[r.teacherName] = [];
            }
            result[r.teacherName].push({
                day: r.day,
                hour: r.hour,
                className: r.className || "",
                subjectName: r.subjectName || "",
            });
        }
        return result;
    } catch {
        return {};
    }
}
