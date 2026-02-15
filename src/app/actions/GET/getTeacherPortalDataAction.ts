"use server";

import { dbLog } from "@/services/loggerService";
import { publicAuthAndParams } from "@/utils/authUtils";
import { getTeacherByIdAction } from "@/app/actions/GET/getTeacherByIdAction";
import { getSchoolAction } from "@/app/actions/GET/getSchoolAction";
import { getCachedTeacherSchedule } from "@/services/schedule/getTeacherSchedule";
import { getPublishedDatesOptions } from "@/resources/dayOptions";
import { chooseDefaultDate } from "@/utils/time";
import { selectSelectedDate } from "@/services/portalTeacherService";
import { SchoolSettingsType } from "@/models/types/settings";
import { TeacherType } from "@/models/types/teachers";
import { SubjectType } from "@/models/types/subjects";
import { ClassType } from "@/models/types/classes";
import { SelectOption } from "@/models/types";
import { GetDailyScheduleResponse } from "@/models/types/dailySchedule";
import messages from "@/resources/messages";
import { getTeachersAction } from "@/app/actions/GET/getTeachersAction";
import { getSubjectsAction } from "@/app/actions/GET/getSubjectsAction";
import { getClassesAction } from "@/app/actions/GET/getClassesAction";
import { PortalType } from "@/models/types";

export interface TeacherPortalDataResponse {
    success: boolean;
    message?: string;
    teacher?: TeacherType;
    settings?: SchoolSettingsType;
    datesOptions?: SelectOption[];
    selectedDate?: string;
    scheduleData?: GetDailyScheduleResponse;
    allTeachers?: TeacherType[];
    allSubjects?: SubjectType[];
    allClasses?: ClassType[];
}

export const getTeacherPortalDataAction = async (
    schoolId: string,
    teacherId: string,
): Promise<TeacherPortalDataResponse> => {
    try {
        const authError = await publicAuthAndParams({ teacherId });
        if (authError) {
            return {
                success: false,
                message: messages.auth.unauthorized
            };
        }

        // 1. Fetch Teacher, School, and Lists in parallel
        const [teacherRes, schoolRes, teachersListRes, subjectsListRes, classesListRes] = await Promise.all([
            getTeacherByIdAction(teacherId),
            getSchoolAction(schoolId),
            getTeachersAction(schoolId, { portalType: PortalType.Teacher, includeSubstitutes: true }),
            getSubjectsAction(schoolId, { portalType: PortalType.Teacher }),
            getClassesAction(schoolId, { portalType: PortalType.Teacher }),
        ]);

        if (!teacherRes.success || !teacherRes.data) {
            return { success: false, message: "Teacher not found" };
        }
        if (!schoolRes.success || !schoolRes.data) {
            return { success: false, message: "School not found" };
        }

        const teacher = teacherRes.data;
        const schoolData = schoolRes.data;

        const allTeachers = teachersListRes.success ? teachersListRes.data : [];
        const allSubjects = subjectsListRes.success ? subjectsListRes.data : [];
        const allClasses = classesListRes.success ? classesListRes.data : [];

        // 2. Prepare Settings & Dates
        const { fromHour, toHour, displaySchedule2Susb } = schoolData;
        const settings: SchoolSettingsType = {
            id: 0,
            schoolId: schoolData.id,
            fromHour,
            toHour,
            displaySchedule2Susb,
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

        // 3. Fetch Schedule if we have a valid date
        let scheduleData: GetDailyScheduleResponse | undefined;

        if (selectedDate && datesOptions.some(d => d.value === selectedDate)) {
            try {
                const schedule = await getCachedTeacherSchedule(teacherId, selectedDate, schoolId);
                scheduleData = {
                    success: true,
                    data: schedule
                };
            } catch (_err) {
                // If schedule fetch fails, we still return the rest of the data
                scheduleData = {
                    success: false,
                    message: "Failed to fetch schedule"
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
            allTeachers,
            allSubjects,
            allClasses
        };

    } catch (error) {
        dbLog({
            description: `Error fetching teacher portal data: ${error instanceof Error ? error.message : String(error)}`,
            schoolId,
            user: teacherId
        });
        return {
            success: false,
            message: messages.common.serverError
        };
    }
};
