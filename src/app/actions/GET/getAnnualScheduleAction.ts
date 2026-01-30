"use server";
import "server-only";
import { AnnualScheduleType, GetAnnualScheduleResponse } from "@/models/types/annualSchedule";
import { checkAuthAndParams } from "@/utils/authUtils";
import messages from "@/resources/messages";
import { eq } from "drizzle-orm";
import { dbLog } from "@/services/loggerService";
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
            });

            return schedules.map(
                (schedule: any) =>
                    ({
                        id: schedule.id,
                        day: schedule.day,
                        hour: schedule.hour,
                        schoolId: schedule.schoolId,
                        classId: schedule.classId,
                        teacherId: schedule.teacherId,
                        subjectId: schedule.subjectId,
                        createdAt: schedule.createdAt,
                        updatedAt: schedule.updatedAt,
                    }) as unknown as AnnualScheduleType,
            );
        });

        return {
            success: true,
            message: messages.annualSchedule.success,
            data: annualSchedule,
        };
    } catch (error) {
        dbLog({ description: `Error fetching annual schedule: ${error instanceof Error ? error.message : String(error)}`, schoolId });
        return {
            success: false,
            message: messages.common.serverError,
        };
    }
}
