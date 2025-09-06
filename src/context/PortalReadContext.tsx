"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { DailyScheduleType, GetDailyScheduleResponse } from "@/models/types/dailySchedule";
import { usePortal } from "./PortalContext";
import getTeacherFullScheduleAction from "@/app/actions/GET/getTeacherFullScheduleAction";

interface PortalReadContextType {
    teacherTableData: DailyScheduleType[] | undefined;
    isLoading: boolean;
}

const PortalReadContext = createContext<PortalReadContextType | undefined>(undefined);

export const usePortalRead = () => {
    const context = useContext(PortalReadContext);
    if (context === undefined) {
        throw new Error("usePortalRead must be used within an PortalReadProvider");
    }
    return context;
};

export const PortalReadProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
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
            response = await getTeacherFullScheduleAction(
                teacher.schoolId,
                teacher.id,
                selectedDate,
            );
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

    const value: PortalReadContextType = {
        teacherTableData,
        isLoading,
    };

    return <PortalReadContext.Provider value={value}>{children}</PortalReadContext.Provider>;
};
