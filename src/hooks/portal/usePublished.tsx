import { getDailyScheduleAction } from "@/app/actions/GET/getDailyScheduleAction";
import { errorToast } from "@/lib/toast";
import { DailySchedule } from "@/models/types/dailySchedule";
import { TeacherType } from "@/models/types/teachers";
import { populateDailyScheduleTable } from "@/services/daily/populate";
import { useState } from "react";

export const usePublished = (schoolId?: string, selectedDate?: string, teacher?: TeacherType) => {
    const [isPublishLoading, setIsPublishLoading] = useState<boolean>(false);
    const [mainPublishTable, setMainPublishTable] = useState<DailySchedule>({});

    const fetchPublishScheduleData = async () => {
        if (!schoolId || !teacher || !selectedDate) return false;
        try {
            setIsPublishLoading(true);
            const response = await getDailyScheduleAction(schoolId, selectedDate);
            if (response.success && response.data && teacher) {
                const newSchedule = await populateDailyScheduleTable(
                    mainPublishTable,
                    selectedDate,
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
        }
    };

    const handlePublishedRefresh = async () => {
        const datesRes = await fetchPublishScheduleData();
        if (!datesRes) {
            errorToast("בעיה בטעינת המידע, נסו שוב");
            return;
        }
    };

    return {
        mainPublishTable,
        isPublishLoading,
        fetchPublishScheduleData,
        handlePublishedRefresh,
    };
};
