"use client";

import React, { createContext, useContext, ReactNode, useState } from "react";
import { TeacherType } from "@/models/types/teachers";
import { PortalSchedule, TeacherScheduleType } from "@/models/types/portalSchedule";
import getTeacherFullScheduleAction from "@/app/actions/GET/getTeacherFullScheduleAction";
import { getTeacherHistoryScheduleAction } from "@/app/actions/GET/getTeacherHistoryScheduleAction";
import { populatePortalTable } from "@/services/portalTeacherService";
import { errorToast } from "@/lib/toast";
import { updateDailyInstructionAction } from "@/app/actions/PUT/updateDailyInstractionAction";
import messages from "@/resources/messages";
import { logErrorAction } from "@/app/actions/POST/logErrorAction";

interface TeacherTableContextType {
    isPortalLoading: boolean;
    isSavingLoading: boolean;
    mainPortalTable: PortalSchedule;
    fetchTeacherScheduleDate: (
        teacher?: TeacherType,
        selectedDate?: string,
    ) => Promise<boolean>;
    refreshMaterialTeacherPortal: (teacher?: TeacherType, selectedDate?: string) => Promise<void>;
    saveInstractions: (
        instructions: string,
        row?: TeacherScheduleType,
        selectedDate?: string,
    ) => Promise<void>;
    hasFetched: boolean;
    isHistoryPage: boolean;
    hydrateSchedule: (scheduleMap: PortalSchedule, date: string) => void;
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
    isHistoryPage?: boolean;
};

export const TeacherTableProvider: React.FC<TeacherTableProviderProps> = ({ children, isHistoryPage = false }) => {
    const [mainPortalTable, setMainPortalTable] = useState<PortalSchedule>({});
    const [isPortalLoading, setIsPortalLoading] = useState<boolean>(false);
    const [isSavingLoading, setIsSavingLoading] = useState<boolean>(false);
    const [hasFetched, setHasFetched] = useState<boolean>(false);

    const fetchTeacherScheduleDate = async (
        teacher?: TeacherType,
        selectedDate?: string,
    ) => {
        if (!teacher?.id || !teacher?.schoolId || !selectedDate) {
            setHasFetched(true);
            return false;
        }
        try {
            // Important: Do not show loader for background refresh, otherwise text which is typed write now will be lost)
            // If mainPortalTable has data for this date, we are just refreshing values -> silent background update
            if (!mainPortalTable[selectedDate]) {
                setIsPortalLoading(true);
            }

            let response;
            if (isHistoryPage && teacher.name) {
                response = await getTeacherHistoryScheduleAction(teacher.name, teacher.schoolId, selectedDate);
            } else {
                response = await getTeacherFullScheduleAction(teacher.id, selectedDate);
            }

            if (response.success && response.data) {
                const newSchedule = populatePortalTable(response.data, mainPortalTable, selectedDate,);
                if (newSchedule) setMainPortalTable(newSchedule);
            } else {
                return false;
            }
            return true;
        } catch (error) {
            logErrorAction({
                description: `Error fetching Teacher Material page data: ${error instanceof Error ? error.message : String(error)}`,
                schoolId: teacher?.schoolId,
                user: teacher?.id,
                metadata: {
                    selectedDate,
                    error: error instanceof Error ? { name: error.name, stack: error.stack, } : error
                }
            });
            return false;
        } finally {
            setIsPortalLoading(false);
            setHasFetched(true);
        }
    };

    const refreshMaterialTeacherPortal = async (teacher?: TeacherType, selectedDate?: string) => {
        const datesRes = await fetchTeacherScheduleDate(teacher, selectedDate);
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
        const originalTeacherId = row.originalTeacher?.id ?? undefined;
        const subTeacherId = row.subTeacher?.id ?? undefined;

        try {
            setIsSavingLoading(true);
            const response = await updateDailyInstructionAction(
                selectedDate,
                row.DBid,
                instructions,
                row.hour,
                schoolId,
                originalTeacherId,
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
            logErrorAction({ description: `Error updating daily schedule entry: ${error instanceof Error ? error.message : String(error)}`, schoolId });
            errorToast(messages.dailySchedule.error);
        } finally {
            setIsSavingLoading(false);
        }
    };

    const hydrateSchedule = (scheduleMap: PortalSchedule, date: string) => {
        setMainPortalTable(prev => ({ ...prev, ...scheduleMap }));
        setHasFetched(true);
    };

    const value: TeacherTableContextType = {
        isPortalLoading,
        isSavingLoading,
        mainPortalTable,
        refreshMaterialTeacherPortal,
        fetchTeacherScheduleDate,
        saveInstractions,
        hasFetched,
        isHistoryPage,
        hydrateSchedule,
    };

    return <TeacherTableContext.Provider value={value}>{children}</TeacherTableContext.Provider>;
};
