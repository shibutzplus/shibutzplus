"use server";

import { DailyScheduleType, GetDailyScheduleResponse } from "@/models/types/dailySchedule";
import { checkAuthAndParams } from "@/utils/authUtils";
import messages from "@/resources/messages";
import { eq } from "drizzle-orm";
import { db, schema } from "../../db";

export async function getDailyScheduleAction(schoolId: string): Promise<GetDailyScheduleResponse> {
    try {
        const authError = await checkAuthAndParams({ schoolId });
        if (authError) {
            return authError as GetDailyScheduleResponse;
        }

        const schedules = await db.query.dailySchedule.findMany({
            where: eq(schema.dailySchedule.schoolId, schoolId),
            with: {
                class: true,
                subject: true,
                absentTeacher: true,
                presentTeacher: true,
                subTeacher: true,
            },
        });

        const dailySchedule = schedules.map(
            (schedule: any) =>
                ({
                    id: schedule.id,
                    date: schedule.date,
                    hour: schedule.hour,
                    position: schedule.position,
                    eventTitle: schedule.eventTitle,
                    event: schedule.event,
                    school: schedule.school,
                    class: schedule.class,
                    subject: schedule.subject,
                    absentTeacher: schedule.absentTeacher,
                    presentTeacher: schedule.presentTeacher,
                    subTeacher: schedule.subTeacher,
                    createdAt: schedule.createdAt,
                    updatedAt: schedule.updatedAt,
                }) as DailyScheduleType,
        );

        return {
            success: true,
            message: messages.dailySchedule.retrieveSuccess,
            data: dailySchedule,
        };
    } catch (error) {
        console.error("Error fetching daily schedule:", error);
        return {
            success: false,
            message: messages.dailySchedule.retrieveError,
        };
    }
}
