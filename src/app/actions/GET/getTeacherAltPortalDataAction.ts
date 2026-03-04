"use server";

import { dbLog } from "@/services/loggerService";
import { publicAuthAndParams } from "@/utils/authUtils";
import { getSchoolAction } from "@/app/actions/GET/getSchoolAction";
import { getCachedTeacherAltSchedule } from "@/services/schedule/getTeacherAltSchedule";
import { getPublishedDatesOptions } from "@/resources/dayOptions";
import { chooseDefaultDate } from "@/utils/time";
import { selectSelectedDate } from "@/services/portalTeacherService";
import { SchoolSettingsType } from "@/models/types/settings";
import { TeacherType } from "@/models/types/teachers";
import { SelectOption } from "@/models/types";
import { GetDailyScheduleResponse } from "@/models/types/dailySchedule";
import messages from "@/resources/messages";
import { getTeacherByIdAction } from "@/app/actions/GET/getTeacherByIdAction";

export interface TeacherAltPortalDataResponse {
    success: boolean;
    message?: string;
    teacher?: TeacherType;
    settings?: SchoolSettingsType;
    datesOptions?: SelectOption[];
    selectedDate?: string;
    scheduleData?: GetDailyScheduleResponse;
}

export const getTeacherAltPortalDataAction = async (
    schoolId: string,
    teacherId: string,
): Promise<TeacherAltPortalDataResponse> => {
    try {
        const authError = await publicAuthAndParams({ teacherId });
        if (authError) {
            return {
                success: false,
                message: messages.auth.unauthorized
            };
        }

        // 1. Fetch School and Teacher in parallel
        const [schoolRes, teacherRes] = await Promise.all([
            getSchoolAction(schoolId),
            getTeacherByIdAction(teacherId),
        ]);

        if (!schoolRes.success || !schoolRes.data) {
            return { success: false, message: "School not found" };
        }

        if (!teacherRes?.success || !teacherRes?.data) {
            return { success: false, message: "Teacher not found" };
        }

        const schoolData = schoolRes.data;
        const teacher = teacherRes.data as TeacherType;

        // 2. Prepare Settings & Dates
        const { fromHour, toHour, displaySchedule2Susb, displayAltSchedule } = schoolData;
        const settings: SchoolSettingsType = {
            id: 0,
            schoolId: schoolData.id,
            fromHour,
            toHour,
            displaySchedule2Susb,
            displayAltSchedule,
        };

        const datesOptions = getPublishedDatesOptions(schoolData.publishDates);
        let selectedDate = "";

        if (datesOptions.length > 0) {
            selectedDate =
                chooseDefaultDate(datesOptions) ??
                selectSelectedDate(datesOptions)?.value ??
                datesOptions[0].value;
        } else {
            selectedDate = chooseDefaultDate() || "";
        }

        // 3. Fetch Alt Schedule if we have a valid date
        let scheduleData: GetDailyScheduleResponse | undefined;

        if (selectedDate) {
            try {
                const schedule = await getCachedTeacherAltSchedule(schoolId, teacherId, selectedDate);
                scheduleData = {
                    success: true,
                    data: schedule
                };
            } catch (err) {
                // If schedule fetch fails, we still return the rest of the data
                scheduleData = {
                    success: false,
                    message: "Failed to fetch alternative schedule"
                };
            }
        }

        return {
            success: true,
            teacher,
            settings,
            datesOptions,
            selectedDate,
            scheduleData,
        };

    } catch (error) {
        dbLog({
            description: `Error fetching teacher alt portal data: ${error instanceof Error ? error.message : String(error)}`,
            schoolId,
            user: teacherId
        });
        return {
            success: false,
            message: messages.common.serverError
        };
    }
};
