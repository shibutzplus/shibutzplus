"use server";

import { DailyScheduleType, DailyScheduleRequest } from "@/models/types/dailySchedule";
import { checkAuthAndParams } from "@/utils/authUtils";
import messages from "@/resources/messages";
import { db, schema } from "../../../db";
import { ActionResponse } from "@/models/types/actions";
import { NewDailyScheduleSchema } from "@/db/schema";
import { getDateReturnString } from "@/utils/time";
import { eventPlaceholder } from "@/models/constant/table";

export async function addDailyEventCellAction(
    scheduleCellData: DailyScheduleRequest,
): Promise<ActionResponse & { data?: DailyScheduleType }> {
    try {
        const {
            date,
            day,
            hour,
            columnId,
            school,
            eventTitle,
            event,
            position
        } = scheduleCellData;

        const authError = await checkAuthAndParams({
            date: date,
            hour: hour,
            columnId: columnId,
            schoolId: school.id,
            eventTitle: eventTitle,
            event: event,
            position: position
        });
        if (authError) {
            return authError as ActionResponse;
        }

        const resEvent = event === eventPlaceholder ? "" : event
        const newRow: NewDailyScheduleSchema = {
            date: getDateReturnString(date),
            day: day,
            hour: hour,
            columnId: columnId,
            schoolId: school.id,
            classId: null,
            subjectId: null,
            absentTeacherId: null,
            presentTeacherId: null,
            subTeacherId: null,
            eventTitle: eventTitle,
            event: resEvent,
            position: position
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
                school,
                class: undefined,
                absentTeacher: undefined,
                presentTeacher: undefined,
                subTeacher: undefined,
                subject: undefined,
                eventTitle,
                event: resEvent,
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
