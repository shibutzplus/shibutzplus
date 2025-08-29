"use server";
import "server-only";
import { AnnualScheduleType, GetAnnualScheduleResponse } from "@/models/types/annualSchedule";
import { checkAuthAndParams } from "@/utils/authUtils";
import messages from "@/resources/messages";
import { eq } from "drizzle-orm";
import { db, schema, executeQuery } from "../../../db";

export async function getAnnualScheduleAction(
    schoolId: string,
): Promise<GetAnnualScheduleResponse> {
    try {
        const authError = await checkAuthAndParams({ schoolId });
        if (authError) {
            return authError as GetAnnualScheduleResponse;
        }

        const annualSchedule = await executeQuery(async () => {
            const schedules = await db.query.annualSchedule.findMany({
                where: eq(schema.annualSchedule.schoolId, schoolId),
                with: {
                    school: true,
                    class: true,
                    teacher: true,
                    subject: true,
                },
            });

            return schedules.map(
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
        });

        return {
            success: true,
            message: messages.annualSchedule.success,
            data: annualSchedule,
        };
    } catch (error) {
        console.error("Error fetching annual schedule:", error);
        return {
            success: false,
            message: messages.common.serverError,
        };
    }
}
