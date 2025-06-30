"use server";

import { AnnualScheduleType, GetAnnualScheduleResponse } from "@/models/types/annualSchedule";
import { checkAuthAndParams } from "@/utils/authUtils";
import messages from "@/resources/messages";
import { eq } from "drizzle-orm";
import { db, schema } from "../../db";

export async function getAnnualScheduleAction(
    schoolId: string,
): Promise<GetAnnualScheduleResponse> {
    try {
        const authError = await checkAuthAndParams({ schoolId });
        if (authError) {
            return authError as GetAnnualScheduleResponse;
        }

        const schedules = await db.query.annualSchedule.findMany({
            where: eq(schema.annualSchedule.schoolId, schoolId),
            with: {
                school: true,
                class: true,
                teacher: true,
                subject: true,
            },
        });

        const annualSchedule = schedules.map(
            (schedule: any) =>
                ({
                    id: schedule.id,
                    day: schedule.day,
                    hour: schedule.hour,
                    school: schedule.school,
                    class: schedule.class,
                    teacher: schedule.teacher,
                    subject: schedule.subject,
                    createdAt: schedule.createdAt,
                    updatedAt: schedule.updatedAt,
                }) as AnnualScheduleType,
        );

        return {
            success: true,
            message: messages.annualSchedule.retrieveSuccess,
            data: annualSchedule,
        };
    } catch (error) {
        console.error("Error fetching annual schedule:", error);
        return {
            success: false,
            message: messages.annualSchedule.retrieveError,
        };
    }
}
