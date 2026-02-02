"use server";

import { db } from "@/db";
import { history } from "@/db/schema";
import { and, eq, or } from "drizzle-orm";
import { dbLog } from "@/services/loggerService";
import { DailyScheduleType, ColumnType, GetDailyScheduleResponse } from "@/models/types/dailySchedule";
import { TeacherType, TeacherRoleValues } from "@/models/types/teachers";
import { SubjectType } from "@/models/types/subjects";
import { ClassType } from "@/models/types/classes";
import { SchoolType } from "@/models/types/school";
import { SCHOOL_LEVEL, SCHOOL_STATUS } from "@/models/constant/school";
import messages from "@/resources/messages";

export async function getTeacherHistoryScheduleAction(
    teacherName: string,
    schoolId: string,
    date: string
): Promise<GetDailyScheduleResponse> {
    try {
        const historyRecords = await db
            .select()
            .from(history)
            .where(
                and(
                    eq(history.schoolId, schoolId),
                    eq(history.date, date),
                    or(
                        eq(history.originalTeacher, teacherName),
                        eq(history.subTeacher, teacherName)
                    )
                )
            );

        if (!historyRecords) {
            return {
                success: true,
                message: "No records found.",
                data: []
            };
        }

        const dailyScheduleData: DailyScheduleType[] = historyRecords.map(record => {
            // Helper to create mock objects
            const makeTeacher = (name: string | null): TeacherType | undefined =>
                name ? { id: "history-teacher", name, schoolId, role: TeacherRoleValues.REGULAR } as TeacherType : undefined;

            const makeSubject = (name: string | null): SubjectType | undefined =>
                name ? { id: "history-subject", name, schoolId } as SubjectType : undefined;

            const makeClasses = (namesStr: string | null): ClassType[] | undefined => {
                if (!namesStr) return undefined;
                return namesStr.split(', ').map((name, index) => ({
                    id: `history-class-${index}`,
                    name,
                    schoolId,
                    activity: false // History does not preserve activity status
                }));
            };

            // Mock School Object (minimal)
            const mockSchool: SchoolType = {
                id: record.schoolId,
                name: "",
                type: SCHOOL_LEVEL.ELEMENTARY,
                status: SCHOOL_STATUS.DAILY,
                publishDates: [],
                createdAt: new Date(),
                updatedAt: new Date(),
                hoursNum: 8,
                displaySchedule2Susb: false
            };

            return {
                id: record.id,
                date: new Date(record.date),
                day: record.day,
                hour: record.hour,
                columnId: record.columnId,
                eventTitle: record.eventTitle || undefined,
                event: record.eventText || undefined,
                school: mockSchool,
                classes: makeClasses(record.classes),
                subject: makeSubject(record.subject),
                originalTeacher: makeTeacher(record.originalTeacher),
                columnType: record.columnType as ColumnType,
                subTeacher: makeTeacher(record.subTeacher),
                instructions: record.instructions || undefined,
                position: record.columnPosition,
                createdAt: record.createdAt,
                updatedAt: record.updatedAt
            };
        });

        return {
            success: true,
            message: messages.dailySchedule.success,
            data: dailyScheduleData.sort((a, b) => a.hour - b.hour)
        };

    } catch (error) {
        dbLog({ description: `Error fetching teacher history schedule: ${error instanceof Error ? error.message : String(error)}`, schoolId });
        return {
            success: false,
            message: "Failed to fetch history.",
            data: []
        };
    }
}
