"use server";

import { unstable_cache } from "next/cache";
import { AnnualScheduleType, GetAnnualScheduleResponse } from "@/models/types/annualSchedule";
import { checkAuthAndParams } from "@/utils/authUtils";
import { CACHE_DURATION_1_HOUR } from "@/utils/time";
import messages from "@/resources/messages";
import { eq } from "drizzle-orm";
import { db, schema } from "../../db";

// Cache annual schedule data with a 1-hour revalidation period
const getCachedAnnualSchedule = unstable_cache(
    async (schoolId: string) => {
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
                    position: schedule.position,
                    school: schedule.school,
                    class: schedule.class,
                    teacher: schedule.teacher,
                    subject: schedule.subject,
                    createdAt: schedule.createdAt,
                    updatedAt: schedule.updatedAt,
                }) as AnnualScheduleType,
        );
    },
    ["annual-schedule-data"],
    { revalidate: CACHE_DURATION_1_HOUR },
);

export async function getAnnualScheduleAction(
    schoolId: string,
): Promise<GetAnnualScheduleResponse> {
    try {
        const authError = await checkAuthAndParams({ schoolId });
        if (authError) {
            return authError as GetAnnualScheduleResponse;
        }

        const annualSchedule = await getCachedAnnualSchedule(schoolId);
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
