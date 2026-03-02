"use client";

import React, { createContext, useContext, ReactNode, useState } from "react";
import { TeacherType } from "@/models/types/teachers";
import { PortalSchedule } from "@/models/types/portalSchedule";
import { getTeacherAltScheduleAction } from "@/app/actions/GET/getTeacherAltScheduleAction";
import { errorToast } from "@/lib/toast";
import { logErrorAction } from "@/app/actions/POST/logErrorAction";

interface TeacherAltTableContextType {
    isPortalLoading: boolean;
    mainPortalTable: PortalSchedule;
    fetchTeacherAltSchedule: (teacher?: TeacherType, selectedDate?: string, schoolId?: string) => Promise<boolean>;
    refreshAltPortal: (teacher?: TeacherType, selectedDate?: string, schoolId?: string) => Promise<void>;
    hasFetched: boolean;
    hydrateSchedule: (scheduleMap: PortalSchedule, date: string) => void;
    resetSchedule: () => void;
}

const TeacherAltTableContext = createContext<TeacherAltTableContextType | undefined>(undefined);

export const useTeacherAltTableContext = () => {
    const context = useContext(TeacherAltTableContext);
    if (context === undefined) {
        throw new Error("useTeacherAltTableContext must be used within a TeacherAltTableProvider");
    }
    return context;
};

export const TeacherAltTableProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [mainPortalTable, setMainPortalTable] = useState<PortalSchedule>({});
    const [isPortalLoading, setIsPortalLoading] = useState<boolean>(false);
    const [hasFetched, setHasFetched] = useState<boolean>(false);

    const fetchTeacherAltSchedule = async (
        teacher?: TeacherType,
        selectedDate?: string,
        schoolId?: string,
    ): Promise<boolean> => {
        if (!teacher?.id || !selectedDate || !schoolId) {
            setHasFetched(true);
            return false;
        }
        try {
            if (!mainPortalTable[selectedDate]) {
                setIsPortalLoading(true);
            }

            const response = await getTeacherAltScheduleAction(teacher.id, selectedDate, schoolId);

            if (response?.success && response?.data) {
                // Build the schedule map directly — avoids populatePortalTable's date comparison
                // which can fail due to UTC vs local time serialization across server/client boundary
                const next: PortalSchedule = { ...mainPortalTable };
                next[selectedDate] = {};
                for (const entry of response.data) {
                    const hour = String(entry.hour);
                    const newEntry = {
                        DBid: entry.id,
                        columnId: entry.columnId,
                        hour: entry.hour,
                        schoolId: entry.school?.id,
                        school: entry.school,
                        classes: entry.classes,
                        subject: entry.subject,
                        isRegular: false,
                    };
                    next[selectedDate][hour] = newEntry;
                }
                setMainPortalTable(next);
                return true;
            }
            return false;
        } catch (error) {
            logErrorAction({
                description: `Error fetching alt schedule for teacher portal: ${error instanceof Error ? error.message : String(error)}`,
                schoolId,
                user: teacher?.name,
                metadata: { selectedDate }
            });
            return false;
        } finally {
            setIsPortalLoading(false);
            setHasFetched(true);
        }
    };

    const refreshAltPortal = async (teacher?: TeacherType, selectedDate?: string, schoolId?: string) => {
        const res = await fetchTeacherAltSchedule(teacher, selectedDate, schoolId);
        if (!res) errorToast("בעיה בטעינת המידע, נסו שוב");
    };

    const hydrateSchedule = (scheduleMap: PortalSchedule, _date: string) => {
        setMainPortalTable(prev => ({ ...prev, ...scheduleMap }));
        setHasFetched(true);
    };

    const resetSchedule = () => {
        setMainPortalTable({});
        setHasFetched(false);
    };

    return (
        <TeacherAltTableContext.Provider value={{
            isPortalLoading,
            mainPortalTable,
            fetchTeacherAltSchedule,
            refreshAltPortal,
            hasFetched,
            hydrateSchedule,
            resetSchedule,
        }}>
            {children}
        </TeacherAltTableContext.Provider>
    );
};
