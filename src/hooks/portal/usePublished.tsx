import { getDailyScheduleAction } from "@/app/actions/GET/getDailyScheduleAction";
import { errorToast } from "@/lib/toast";
import { DailySchedule, GetDailyScheduleResponse } from "@/models/types/dailySchedule";
import { TeacherType } from "@/models/types/teachers";
import messages from "@/resources/messages";
import { populateDailyScheduleTable } from "@/services/daily/populate";
import { useState } from "react";

export const usePublished = (schoolId?: string, selectedDate?: string, teacher?: TeacherType) => {
    const [isPublishLoading, setIsPublishLoading] = useState<boolean>(false);
    const [mainPublishTable, setMainPublishTable] = useState<DailySchedule>({});
    const [hasFetched, setHasFetched] = useState<boolean>(false);

    const fetchPublishScheduleData = async (
        overrideSchoolId?: string,
        overrideDate?: string,
        overrideTeacher?: TeacherType
    ): Promise<GetDailyScheduleResponse | null> => {
        const effectiveSchoolId = overrideSchoolId || schoolId;
        const effectiveTeacher = overrideTeacher || teacher;
        const effectiveDate = overrideDate || selectedDate;

        if (!effectiveSchoolId || !effectiveTeacher || !effectiveDate) {
            setMainPublishTable({});
            setHasFetched(true);
            return null;
        }
        try {
            setIsPublishLoading(true);
            const response = await getDailyScheduleAction(effectiveSchoolId, effectiveDate, { isPrivate: false });
            if (response.success && response.data && effectiveTeacher) {
                const newSchedule = await populateDailyScheduleTable(
                    mainPublishTable,
                    effectiveDate,
                    response.data,
                );
                if (newSchedule) setMainPublishTable(newSchedule);
            } else {
                setMainPublishTable({});
                return response;
            }
            return response;
        } catch (error) {
            console.error("Error fetching daily schedule data:", error);
            return null;
        } finally {
            setIsPublishLoading(false);
            setHasFetched(true);
        }
    };

    const handlePublishedRefresh = async (
        overrideSchoolId?: string,
        overrideDate?: string,
        overrideTeacher?: TeacherType
    ) => {
        const response = await fetchPublishScheduleData(overrideSchoolId, overrideDate, overrideTeacher);

        // If response is null, it's a validation/exception error -> Toast
        // If response exists but success is false, check if it's "Already published" (Wait no, "Not Published")
        if (!response) {
            errorToast("בעיה בטעינת המידע, נסו שוב");
            return;
        }

        if (!response.success) {
            if (response.message !== messages.dailySchedule.notPublished) {
                errorToast(response.message || "בעיה בטעינת המידע, נסו שוב");
            }
        }
    };

    return {
        mainPublishTable,
        isPublishLoading,
        fetchPublishScheduleData,
        handlePublishedRefresh,
        hasFetched,
    };
};
