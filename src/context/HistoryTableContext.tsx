"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import { SelectOption } from "@/models/types";
import { getTomorrowOption, getYearDayOptions } from "@/resources/dayOptions";

interface HistoryTableContextType {
    selectedYearDate: string;
    yearDaysSelectOptions: () => SelectOption[];
    handleYearDayChange: (value: string) => void;
}

const HistoryTableContext = createContext<HistoryTableContextType | undefined>(undefined);

export const useHistoryTable = () => {
    const context = useContext(HistoryTableContext);
    if (context === undefined) {
        throw new Error("useHistoryTable must be used within an HistoryTableProvider");
    }
    return context;
};

export const HistoryTableProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [selectedYearDate, setSelectedYearDayId] = useState<string>(getTomorrowOption());

    const yearDaysSelectOptions = () => {
        return getYearDayOptions();
    };

    const handleYearDayChange = (value: string) => {
        setSelectedYearDayId(value);
    };

    const value: HistoryTableContextType = {
        selectedYearDate,
        yearDaysSelectOptions,
        handleYearDayChange,
    };

    return <HistoryTableContext.Provider value={value}>{children}</HistoryTableContext.Provider>;
};
