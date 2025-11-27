import getTeacherFullScheduleAction from "@/app/actions/GET/getTeacherFullScheduleAction";
import { updateDailyInstructionAction } from "@/app/actions/PUT/updateDailyInstractionAction";
import { errorToast } from "@/lib/toast";
import { PortalSchedule, TeacherScheduleType } from "@/models/types/portalSchedule";
import { TeacherType } from "@/models/types/teachers";
import messages from "@/resources/messages";
import { populatePortalTable } from "@/services/portalTeacherService";
import { useState } from "react";
// NOT IN USE
export const usePortal = (schoolId?: string, selectedDate?: string) => {
    const [mainPortalTable, setMainPortalTable] = useState<PortalSchedule>({});
    const [isPortalLoading, setIsPortalLoading] = useState<boolean>(true);
    const [isSavingLoading, setIsSavingLoading] = useState<boolean>(false);

    const fetchPortalScheduleDate = async (teacher?: TeacherType) => {
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

    const handlePortalRefresh = async (teacher?: TeacherType) => {
        const datesRes = await fetchPortalScheduleDate(teacher);
        if (!datesRes) {
            errorToast("בעיה בטעינת המידע, נסו שוב");
            return;
        }
    };

    const saveInstractions = async (instructions: string, row?: TeacherScheduleType) => {
        if (!row || !selectedDate) return;
        const schoolId = row.schoolId ?? row.school?.id;
        const issueTeacherId = row.issueTeacher?.id ?? undefined;
        const subTeacherId = row.subTeacher?.id ?? undefined;

        try {
            setIsSavingLoading(true);
            const response = await updateDailyInstructionAction(
                selectedDate,
                row.DBid,
                instructions,
                row.hour,
                schoolId,
                issueTeacherId,
                subTeacherId,
            );
            if (response.success) {
                const portalSchedule = { ...mainPortalTable };
                portalSchedule[selectedDate][`${row.hour}`].instructions = instructions;
                setMainPortalTable(portalSchedule);
            } else {
                errorToast(messages.dailySchedule.error);
            }
        } catch (error) {
            console.error("Error updating daily schedule entry:", error);
            errorToast(messages.dailySchedule.error);
        } finally {
            setIsSavingLoading(false);
        }
    };

    return {
        mainPortalTable,
        isPortalLoading,
        isSavingLoading,
        fetchPortalScheduleDate,
        handlePortalRefresh,
        saveInstractions,
    };
};
