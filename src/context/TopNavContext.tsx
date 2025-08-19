"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { useMainContext } from "./MainContext";
import { createSelectOptions, sortByHebrewName } from "@/utils/format";
import { ClassType } from "@/models/types/classes";
import { SelectOption } from "@/models/types";
import { getDayOptions, getTomorrowOption, getYearDayOptions } from "@/resources/dayOptions";

interface TopNavContextType {
    selectedClassId: string;
    getSelectedClass: () => ClassType | undefined;
    classesSelectOptions: () => SelectOption[];
    daysSelectOptions: () => SelectOption[];
    handleClassChange: (value: string) => void;
    selectedDate: string;
    handleDayChange: (value: string) => void;
    yearDaysSelectOptions: () => SelectOption[];
    selectedYearDate: string;
    handleYearDayChange: (value: string) => void;
}

const TopNavContext = createContext<TopNavContextType | undefined>(undefined);

export const useTopNav = () => {
    const context = useContext(TopNavContext);
    if (context === undefined) {
        throw new Error("useTopNav must be used within an TopNavProvider");
    }
    return context;
};

export const TopNavProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { classes } = useMainContext();
    const [selectedClassId, setSelectedClassId] = useState<string>(classes?.[0]?.id || "");
    const [selectedDate, setSelectedDayId] = useState<string>(getTomorrowOption());
    const [selectedYearDate, setSelectedYearDayId] = useState<string>(getTomorrowOption());

    useEffect(() => {
        if (classes && classes?.length > 0 && selectedClassId === "") {
            setSelectedClassId(classes[0].id);
        }
    }, [classes]);

    // -- annualSchedule -- //

    const getSelectedClass = () => {
        return classes?.find((c) => c.id === selectedClassId);
    };

    const classesSelectOptions = () => {
        return createSelectOptions<ClassType>(sortByHebrewName(classes || []));
    };

    const handleClassChange = (value: string) => {
        setSelectedClassId(value);
    };

    // -- dailySchedule -- //

    const daysSelectOptions = () => {
        return getDayOptions();
    };

    const handleDayChange = (value: string) => {
        setSelectedDayId(value);
    };

    // -- history -- //

    const yearDaysSelectOptions = () => {
        return getYearDayOptions();
    };

    const handleYearDayChange = (value: string) => {
        setSelectedYearDayId(value);
    };

    const value: TopNavContextType = {
        selectedClassId,
        getSelectedClass,
        classesSelectOptions,
        daysSelectOptions,
        handleClassChange,
        selectedDate,
        handleDayChange,
        yearDaysSelectOptions,
        selectedYearDate,
        handleYearDayChange,
    };

    return <TopNavContext.Provider value={value}>{children}</TopNavContext.Provider>;
};
