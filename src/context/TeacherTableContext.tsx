"use client";

import React, { createContext, useContext, ReactNode, useState } from "react";
import { TeacherType } from "@/models/types/teachers";
import { PortalSchedule, TeacherScheduleType } from "@/models/types/portalSchedule";
import getTeacherFullScheduleAction from "@/app/actions/GET/getTeacherFullScheduleAction";
import { populatePortalTable } from "@/services/portalTeacherService";
import { errorToast } from "@/lib/toast";
import { updateDailyInstructionAction } from "@/app/actions/PUT/updateDailyInstractionAction";
import messages from "@/resources/messages";

interface TeacherTableContextType {
    isPortalLoading: boolean;
    isSavingLoading: boolean;
    mainPortalTable: PortalSchedule;
    fetchTeacherScheduleDate: (
        teacher?: TeacherType,
        schoolId?: string,
        selectedDate?: string,
    ) => Promise<boolean>;
    handlePortalRefresh: (teacher?: TeacherType) => Promise<void>;
    saveInstractions: (
        instructions: string,
        row?: TeacherScheduleType,
        selectedDate?: string,
    ) => Promise<void>;
    hasFetched: boolean;
}

const TeacherTableContext = createContext<TeacherTableContextType | undefined>(undefined);

export const useTeacherTableContext = () => {
    const context = useContext(TeacherTableContext);
    if (context === undefined) {
        throw new Error("useTeacherTableContext must be used within an TeacherTableProvider");
    }
    return context;
};

type TeacherTableProviderProps = {
    children: ReactNode;
};

export const TeacherTableProvider: React.FC<TeacherTableProviderProps> = ({ children }) => {
    const [mainPortalTable, setMainPortalTable] = useState<PortalSchedule>({});
    const [isPortalLoading, setIsPortalLoading] = useState<boolean>(false);
    const [isSavingLoading, setIsSavingLoading] = useState<boolean>(false);
    const [hasFetched, setHasFetched] = useState<boolean>(false);

    const fetchTeacherScheduleDate = async (
        teacher?: TeacherType,
        selectedDate?: string,
    ) => {
        if (!teacher || !selectedDate) return false;
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
            setHasFetched(true);
        }
    };

    const handlePortalRefresh = async (teacher?: TeacherType) => {
        const datesRes = await fetchTeacherScheduleDate(teacher);
        if (!datesRes) {
            errorToast("בעיה בטעינת המידע, נסו שוב");
            return;
        }
    };

    const saveInstractions = async (
        instructions: string,
        row?: TeacherScheduleType,
        selectedDate?: string,
    ) => {
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
    const value: TeacherTableContextType = {
        isPortalLoading,
        isSavingLoading,
        mainPortalTable,
        handlePortalRefresh,
        fetchTeacherScheduleDate,
        saveInstractions,
        hasFetched,
    };

    return <TeacherTableContext.Provider value={value}>{children}</TeacherTableContext.Provider>;
};
