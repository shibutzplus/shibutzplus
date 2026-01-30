"use server";

import { DailyScheduleType, GetDailyScheduleResponse } from "@/models/types/dailySchedule";
import { checkAuthAndParams, publicAuthAndParams } from "@/utils/authUtils";
import messages from "@/resources/messages";
import { and, eq } from "drizzle-orm";
import { dbLog } from "@/services/loggerService";
import { db, schema, executeQuery } from "../../../db";

export async function getDailyScheduleAction(
    schoolId: string,
    date: string,
    options: { isPrivate: boolean } = { isPrivate: true },
): Promise<GetDailyScheduleResponse> {
    try {
        let authError;
        if (options.isPrivate) {
            authError = await checkAuthAndParams({ schoolId, date });
        } else {
            authError = await publicAuthAndParams({ schoolId, date });
        }
        if (authError) return authError as GetDailyScheduleResponse;

        // For public access, verify the date is actually published!
        if (!options.isPrivate) {
            const school = await executeQuery(async () => {
                return await db.query.schools.findFirst({
                    where: eq(schema.schools.id, schoolId),
                    columns: {
                        publishDates: true,
                    },
                });
            });

            if (!school?.publishDates?.includes(date)) {
                return {
                    success: false,
                    message: messages.dailySchedule.notPublished,
                };
            }
        }

        const dailySchedule = await executeQuery(async () => {
            const schedules = await db.query.dailySchedule.findMany({
                where: and(
                    eq(schema.dailySchedule.schoolId, schoolId),
                    eq(schema.dailySchedule.date, date),
                ),
            });

            return schedules.map(
                (schedule: any) =>
                    ({
                        id: schedule.id,
                        date: schedule.date,
                        day: schedule.day,
                        hour: schedule.hour,
                        columnId: schedule.columnId,
                        eventTitle: schedule.eventTitle,
                        event: schedule.event,
                        schoolId: schedule.schoolId,
                        classIds: schedule.classIds,
                        subjectId: schedule.subjectId,
                        originalTeacherId: schedule.originalTeacherId,
                        columnType: schedule.columnType,
                        subTeacherId: schedule.subTeacherId,
                        position: schedule.position,
                        createdAt: schedule.createdAt,
                        updatedAt: schedule.updatedAt,
                    }) as unknown as DailyScheduleType, // Cast to maintain type compat for now, will fix frontend next
            );
        });

        return {
            success: true,
            message: messages.dailySchedule.success,
            data: dailySchedule,
        };
    } catch (error) {
        dbLog({ description: `Error fetching daily schedule: ${error instanceof Error ? error.message : String(error)}`, schoolId });
        return {
            success: false,
            message: messages.common.serverError,
        };
    }
}
