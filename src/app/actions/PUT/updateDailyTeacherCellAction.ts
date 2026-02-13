"use server";

import { DailyScheduleType, DailyScheduleRequest } from "@/models/types/dailySchedule";
import { publicAuthAndParams } from "@/utils/authUtils";
import messages from "@/resources/messages";
import { eq } from "drizzle-orm";
import { db, schema, executeQuery } from "../../../db";
import { dbLog } from "@/services/loggerService";
import { ActionResponse } from "@/models/types/actions";
import { NewDailyScheduleSchema } from "@/db/schema";
import { getDateReturnString, getStringReturnDate } from "@/utils/time";
import { pushSyncUpdateServer } from "@/services/sync/serverSyncService";
import { DAILY_TEACHER_COL_DATA_CHANGED } from "@/models/constant/sync";
import { revalidateTag } from "next/cache";
import { cacheTags } from "@/lib/cacheTags";

export async function updateDailyTeacherCellAction(
    id: string,
    scheduleData: DailyScheduleRequest,
): Promise<ActionResponse & { data?: DailyScheduleType }> {
    const {
        school,
        classes,
        subject,
        originalTeacher,
        columnType,
        subTeacher,
        eventTitle,
        event,
        position,
        instructions,
        day,
        date,
        hour,
        columnId,
    } = scheduleData;
    try {

        const authError = await publicAuthAndParams({
            id,
            date: date,
            day: day,
            hour: hour,
            columnId: columnId,
            schoolId: school.id,
            classesIds: classes?.map((c) => c.id),
            subjectId: subject?.id,
        });
        if (authError || !subject) {
            return authError as ActionResponse;
        }

        // Build update payload (minimal change: handle instructions conditionally)
        const updateData: Partial<NewDailyScheduleSchema> = {
            date: getDateReturnString(scheduleData.date),
            day: day,
            hour: scheduleData.hour,
            columnId: scheduleData.columnId,
            schoolId: school.id,
            classIds: classes?.map((c) => c.id),
            subjectId: subject.id,
            originalTeacherId: originalTeacher?.id,
            columnType: columnType,
            subTeacherId: subTeacher?.id || null,
            eventTitle: eventTitle,
            event: event || null,
            position: position,
        };

        // Only update instructions if it was provided; otherwise leave DB value as-is
        if (instructions !== undefined) {
            updateData.instructions =
                typeof instructions === "string" && instructions.trim() === "" ? null : instructions;
        }

        const updatedEntry = await executeQuery(async () => {
            return await db
                .update(schema.dailySchedule)
                .set(updateData)
                .where(eq(schema.dailySchedule.id, id))
                .returning();
        });

        if (!updatedEntry[0]) {
            return {
                success: false,
                message: messages.dailySchedule.updateError,
            };
        }

        const updateSchedule = updatedEntry[0];

        // invalidate cache
        revalidateTag(cacheTags.schoolSchedule(school.id));

        const dateString = getDateReturnString(date);
        void pushSyncUpdateServer(DAILY_TEACHER_COL_DATA_CHANGED, { schoolId: school.id, date: dateString });

        return {
            success: true,
            message: messages.annualSchedule.updateSuccess,
            data: {
                id: updateSchedule.id,
                date: getStringReturnDate(updateSchedule.date),
                day: updateSchedule.day,
                hour: updateSchedule.hour,
                columnId: updateSchedule.columnId,
                createdAt: updateSchedule.createdAt,
                updatedAt: updateSchedule.updatedAt,
                classes,
                school,
                subject,
                originalTeacher,
                columnType,
                subTeacher,
                eventTitle,
                event,
                position,
                instructions: updateSchedule.instructions,
            } as DailyScheduleType,
        };
    } catch (error) {
        dbLog({
            description: `Error updating daily schedule (teacher cell): ${error instanceof Error ? error.message : String(error)}`,
            schoolId: school.id,
            metadata: { id, date, hour }
        });
        return {
            success: false,
            message: messages.common.serverError,
        };
    }
}
