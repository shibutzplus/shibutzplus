"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { getDailyByTeacherAction } from "@/app/actions/GET/getDailyByTeacherAction";
import { DailyScheduleType, GetDailyScheduleResponse } from "@/models/types/dailySchedule";
import { usePortal } from "./PortalContext";

interface PortalWriteContextType {
    teacherTableData: DailyScheduleType[] | undefined;
    isLoading: boolean;
}

const PortalWriteContext = createContext<PortalWriteContextType | undefined>(undefined);

export const usePortalWrite = () => {
    const context = useContext(PortalWriteContext);
    if (context === undefined) {
        throw new Error("usePortalWrite must be used within an PortalWriteProvider");
    }
    return context;
};

export const PortalWriteProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { selectedDate, teacher } = usePortal();
    const [teacherTableData, setTeacherTableData] = useState<DailyScheduleType[] | undefined>();
    const [isLoading, setIsLoading] = useState<boolean>(false);

    useEffect(() => {
        // TODO: add cache
        getTeacherTableData();
    }, [selectedDate]);

    const getTeacherTableData = async () => {
        if (!teacher || !selectedDate) return;
        let response: GetDailyScheduleResponse | undefined;
        setIsLoading(true);
        try {
            response = await getDailyByTeacherAction(teacher.id, selectedDate);
            if (response && response.success && response.data) {
                setTeacherTableData(response.data);
            } else {
                setTeacherTableData([]);
            }
        } catch (error) {
            console.error("Error fetching teacher table data:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const value: PortalWriteContextType = {
        teacherTableData,
        isLoading,
    };

    return <PortalWriteContext.Provider value={value}>{children}</PortalWriteContext.Provider>;
};
