"use server";

import { DailyScheduleType, DailyScheduleRequest } from "@/models/types/dailySchedule";
import { checkAuthAndParams } from "@/utils/authUtils";
import messages from "@/resources/messages";
import { db, schema } from "../../../db";
import { ActionResponse } from "@/models/types/actions";
import { NewDailyScheduleSchema } from "@/db/schema";
import { getDateReturnString } from "@/utils/time";

export async function addDailyTeacherCellAction(
    scheduleCellData: DailyScheduleRequest,
): Promise<ActionResponse & { data?: DailyScheduleType }> {
    try {
        const {
            date,
            day,
            hour,
            columnId,
            school,
            class: classData,
            subject,
            issueTeacher,
            issueTeacherType,
            subTeacher,
            eventTitle,
            event,
            position,
        } = scheduleCellData;

        const authError = await checkAuthAndParams({
            date: date,
            hour: hour,
            columnId: columnId,
            schoolId: school.id,
            classId: classData?.id,
            subjectId: subject?.id,
        });
        if (authError || !classData || !subject) {
            return authError as ActionResponse;
        }

        const newRow: NewDailyScheduleSchema = {
            date: getDateReturnString(date),
            day: day,
            hour: hour,
            columnId: columnId,
            schoolId: school.id,
            classId: classData.id,
            subjectId: subject.id,
            issueTeacherId: issueTeacher?.id,
            issueTeacherType: issueTeacherType,
            subTeacherId: subTeacher?.id,
            eventTitle: eventTitle,
            event: event,
            position: position,
        };

        const newDailySchedule = (
            await db.insert(schema.dailySchedule).values(newRow).returning()
        )[0];

        if (!newDailySchedule) {
            return {
                success: false,
                message: messages.dailySchedule.createError,
            };
        }

        return {
            success: true,
            message: messages.dailySchedule.createSuccess,
            data: {
                id: newDailySchedule.id,
                date: new Date(newDailySchedule.date),
                day: newDailySchedule.day,
                hour: newDailySchedule.hour,
                columnId: newDailySchedule.columnId,
                createdAt: newDailySchedule.createdAt,
                updatedAt: newDailySchedule.updatedAt,
                class: classData,
                school,
                issueTeacher,
                issueTeacherType,
                subTeacher,
                subject,
                eventTitle,
                event,
                position,
            } as DailyScheduleType,
        };
    } catch (error) {
        console.error("Error creating daily schedule entry:", error);
        return {
            success: false,
            message: messages.common.serverError,
        };
    }
}
