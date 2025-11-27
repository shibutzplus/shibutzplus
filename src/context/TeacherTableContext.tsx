"use client";

import React, { createContext, useContext, ReactNode } from "react";
import { TeacherType } from "@/models/types/teachers";
import { PortalSchedule, TeacherScheduleType } from "@/models/types/portalSchedule";
import { usePortal } from "@/hooks/portal/usePortal";

interface TeacherTableContextType {
    isPortalLoading: boolean;
    isSavingLoading: boolean;
    mainPortalTable: PortalSchedule;
    fetchTeacherScheduleDate: (teacher?: TeacherType) => Promise<boolean>;
    handlePortalRefresh: (teacher?: TeacherType) => Promise<void>;
    saveInstractions: (instructions: string, row?: TeacherScheduleType) => Promise<void>;
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
    schoolId?: string;
    selectedDate?: string;
};

export const TeacherTableProvider: React.FC<TeacherTableProviderProps> = ({
    children,
    schoolId,
    selectedDate,
}) => {
    const {
        fetchPortalScheduleDate,
        handlePortalRefresh,
        saveInstractions,
        mainPortalTable,
        isPortalLoading,
        isSavingLoading,
    } = usePortal(schoolId, selectedDate);

    const value: TeacherTableContextType = {
        isPortalLoading,
        isSavingLoading,
        mainPortalTable,
        handlePortalRefresh,
        fetchTeacherScheduleDate: fetchPortalScheduleDate,
        saveInstractions,
    };

    return <TeacherTableContext.Provider value={value}>{children}</TeacherTableContext.Provider>;
};
