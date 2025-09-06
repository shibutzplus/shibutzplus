"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import { SelectOption } from "@/models/types";
import { getTomorrowOption, getYearDayOptions } from "@/resources/dayOptions";

interface DailyPortalContextType {
    selectedYearDate: string;
    yearDaysSelectOptions: () => SelectOption[];
    handleYearDayChange: (value: string) => void;
}

const DailyPortalContext = createContext<DailyPortalContextType | undefined>(undefined);

export const useDailyPortal = () => {
    const context = useContext(DailyPortalContext);
    if (context === undefined) {
        throw new Error("useDailyPortal must be used within an DailyPortalProvider");
    }
    return context;
};

export const DailyPortalProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [selectedYearDate, setSelectedYearDayId] = useState<string>(getTomorrowOption());

    const yearDaysSelectOptions = () => {
        return getYearDayOptions();
    };

    const handleYearDayChange = (value: string) => {
        setSelectedYearDayId(value);
    };

    const value: DailyPortalContextType = {
        selectedYearDate,
        yearDaysSelectOptions,
        handleYearDayChange,
    };

    return <DailyPortalContext.Provider value={value}>{children}</DailyPortalContext.Provider>;
};
