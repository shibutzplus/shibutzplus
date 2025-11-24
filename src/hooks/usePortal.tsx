import getTeacherFullScheduleAction from "@/app/actions/GET/getTeacherFullScheduleAction";
import { errorToast } from "@/lib/toast";
import { PortalSchedule } from "@/models/types/portalSchedule";
import { TeacherType } from "@/models/types/teachers";
import { populatePortalTable } from "@/services/portalTeacherService";
import { useState } from "react";

export const usePortal = (schoolId?: string, selectedDate?: string, teacher?: TeacherType) => {
    const [mainPortalTable, setMainPortalTable] = useState<PortalSchedule>({});
    const [isPortalLoading, setIsPortalLoading] = useState<boolean>(true);

    const fetchPortalScheduleDate = async () => {
        if (!teacher || !selectedDate || !schoolId) return false;
        try {
            setIsPortalLoading(true);
            const response = await getTeacherFullScheduleAction(teacher.id, selectedDate);
            if (response.success && response.data) {
                const newSchedule = populatePortalTable(
                    response.data,
                    mainPortalTable,
                    selectedDate,
                );
                if (newSchedule) setMainPortalTable(newSchedule);
            } else {
                return false;
            }
            return true;
        } catch (error) {
            console.error("Error fetching daily schedule data:", error);
            return false;
        } finally {
            setIsPortalLoading(false);
        }
    };

    const handlePortalRefresh = async () => {
        const datesRes = await fetchPortalScheduleDate();
        if (!datesRes) {
            errorToast("בעיה בטעינת המידע, נסו שוב");
            return;
        }
    };

    return {
        mainPortalTable,
        isPortalLoading,
        fetchPortalScheduleDate,
        handlePortalRefresh,
    };
};
