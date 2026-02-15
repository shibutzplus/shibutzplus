"use server";

import { GetDailyScheduleResponse } from "@/models/types/dailySchedule";
import { checkAuthAndParams, publicAuthAndParams } from "@/utils/authUtils";
import messages from "@/resources/messages";
import { eq } from "drizzle-orm";
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

        const { getCachedDailySchedule } = await import("@/services/schedule/getCachedDailySchedule");
        const dailySchedule = await getCachedDailySchedule(schoolId, date);

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
