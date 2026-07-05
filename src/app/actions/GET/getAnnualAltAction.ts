"use server";
import "server-only";
import { GetAnnualScheduleResponse } from "@/models/types/annualSchedule";
import { publicAuthAndParams } from "@/utils/authUtils";
import messages from "@/resources/messages";
import { dbLog } from "@/services/loggerService";
import { db, schema, executeQuery } from "@/db";
import { eq } from "drizzle-orm";
import { AnnualScheduleType } from "@/models/types/annualSchedule";
import { unstable_cache } from "next/cache";
import { cacheTags } from "@/lib/cacheTags";

const annualAltCache = new Map<string, any>();

export const getAnnualAltAction = async (
    schoolId: string,
): Promise<GetAnnualScheduleResponse> => {
    try {
        const authError = await publicAuthAndParams({ schoolId });
        if (authError) {
            return authError as GetAnnualScheduleResponse;
        }

        if (!annualAltCache.has(schoolId)) {
            annualAltCache.set(schoolId, unstable_cache(
                async () => {
                    return await executeQuery(async () => {
                        return await db
                            .select()
                            .from(schema.annualScheduleAlt)
                            .where(eq(schema.annualScheduleAlt.schoolId, schoolId));
                    });
                },
                ['getAnnualAlt', schoolId],
                {
                    tags: [cacheTags.annualAltSchedule(schoolId)],
                    revalidate: 604800, // 7 days
                }
            ));
        }

        const schedules = await annualAltCache.get(schoolId)();

        const data: AnnualScheduleType[] = (schedules || []).map((s: any) => ({
            id: s.id,
            day: s.day,
            hour: s.hour,
            schoolId: s.schoolId,
            classId: s.classId,
            teacherId: s.teacherId,
            subjectId: s.subjectId,
            createdAt: s.createdAt,
            updatedAt: s.updatedAt,
        })) as unknown as AnnualScheduleType[];

        return {
            success: true,
            message: messages.annualSchedule.success,
            data,
        };
    } catch (error) {
        dbLog({ description: `Error fetching alt schedule: ${error instanceof Error ? error.message : String(error)}`, schoolId });
        return {
            success: false,
            message: messages.common.serverError,
        };
    }
}
