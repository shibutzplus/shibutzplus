"use server";

import { DailyScheduleType, DailyScheduleRequest } from "@/models/types/dailySchedule";
import { checkAuthAndParams } from "@/utils/authUtils";
import messages from "@/resources/messages";
import { db, schema, executeQuery } from "../../../db";
import { ActionResponse } from "@/models/types/actions";
import { NewDailyScheduleSchema } from "@/db/schema";
import { getDateReturnString } from "@/utils/time";

//
//  Batch Insert mechanism:
// This action accepts an array of cells and inserts them all into the database in a single query.
//
export async function addDailyTeacherCellsAction(
    scheduleCellsData: DailyScheduleRequest[],
): Promise<ActionResponse & { data?: DailyScheduleType[] }> {
    try {
        if (!scheduleCellsData || scheduleCellsData.length === 0) {
            return {
                success: true,
                message: "No data to add",
                data: [],
            };
        }

        // Check authentication once
        const firstItem = scheduleCellsData[0];
        const authError = await checkAuthAndParams({
            schoolId: firstItem.school.id,
        });

        if (authError) {
            return authError as ActionResponse;
        }

        const validInputs: DailyScheduleRequest[] = [];
        const newRows: NewDailyScheduleSchema[] = [];

        for (const cellData of scheduleCellsData) {
            const {
                date,
                day,
                hour,
                columnId,
                school,
                classes,
                subject,
                originalTeacher,
                columnType,
                subTeacher,
                eventTitle,
                event,
                position,
            } = cellData;

            // Basic validation per item
            if (!subject || !classes) {
                continue; // Skip invalid items or handle error
            }

            const newRow: NewDailyScheduleSchema = {
                date: getDateReturnString(date),
                day: day,
                hour: hour,
                columnId: columnId,
                schoolId: school.id,
                subjectId: subject.id,
                classIds: classes.map((c) => c.id),
                originalTeacherId: originalTeacher?.id,
                columnType: columnType,
                subTeacherId: subTeacher?.id,
                eventTitle: eventTitle,
                event: event,
                position: position,
            };
            newRows.push(newRow);
            validInputs.push(cellData);
        }

        if (newRows.length === 0) {
            return {
                success: false,
                message: messages.dailySchedule.createError,
            };
        }

        const newDailySchedules = await executeQuery(async () => {
            return await db.insert(schema.dailySchedule).values(newRows).returning();
        });

        if (!newDailySchedules || newDailySchedules.length === 0) {
            return {
                success: false,
                message: messages.dailySchedule.createError,
            };
        }

        const resultData: DailyScheduleType[] = newDailySchedules.map((dbRecord, index) => {
            const input = validInputs[index];
            return {
                id: dbRecord.id,
                date: new Date(dbRecord.date),
                day: dbRecord.day,
                hour: dbRecord.hour,
                columnId: dbRecord.columnId,
                createdAt: dbRecord.createdAt,
                updatedAt: dbRecord.updatedAt,
                classes: input?.classes,
                school: input?.school,
                originalTeacher: input?.originalTeacher,
                columnType: input?.columnType,
                subTeacher: input?.subTeacher,
                subject: input?.subject,
                eventTitle: input?.eventTitle,
                event: input?.event,
                position: input?.position
            } as DailyScheduleType;
        });


        return {
            success: true,
            message: messages.dailySchedule.createSuccess,
            data: resultData,
        };
    } catch (error) {
        console.error("Error creating daily schedule entries:", error);
        return {
            success: false,
            message: messages.common.serverError,
        };
    }
}
