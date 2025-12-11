import { getDailyScheduleAction } from "@/app/actions/GET/getDailyScheduleAction";
import { errorToast } from "@/lib/toast";
import { DailySchedule } from "@/models/types/dailySchedule";
import { TeacherType } from "@/models/types/teachers";
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
    ) => {
        const effectiveSchoolId = overrideSchoolId || schoolId;
        const effectiveTeacher = overrideTeacher || teacher;
        const effectiveDate = overrideDate || selectedDate;

        if (!effectiveSchoolId || !effectiveTeacher || !effectiveDate) {
            setHasFetched(true);
            return false;
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
                return false;
            }
            return true;
        } catch (error) {
            console.error("Error fetching daily schedule data:", error);
            return false;
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
        const datesRes = await fetchPublishScheduleData(overrideSchoolId, overrideDate, overrideTeacher);
        if (!datesRes) {
            // If data is just missing (valid fetch, just no data), we shouldn't necessarily error.
            // But if it returned false, it means something went wrong OR inputs were missing.
            // For now, keeping the toast but the inputs check handles the "stuck" part.
            // Wait, if early return (missing inputs) returns false, this toast will trigger.
            // We should only toast if it was an ACTUAL error?
            // "early return" returns false. So toast triggers.
            // BUT, if we pass valid overrides, it won't early return.
            errorToast("בעיה בטעינת המידע, נסו שוב");
            return;
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
