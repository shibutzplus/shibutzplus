"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { useMainContext } from "./MainContext";
import { createSelectOptions } from "@/utils/format";
import { ClassType } from "@/models/types/classes";
import { SelectOption } from "@/models/types";
import { getDayOptions, getTomorrowOption } from "@/resources/dayOptions";

// TODO: delete this context and use the layout props

interface ActionsContextType {
    selectedClassId: string;
    getSelectedClass: () => ClassType | undefined;
    classesSelectOptions: () => SelectOption[];
    daysSelectOptions: () => SelectOption[];
    handleClassChange: (value: string) => void;
    selectedDate: string;
    handleDayChange: (value: string) => void;
}

const ActionsContext = createContext<ActionsContextType | undefined>(undefined);

export const useActions = () => {
    const context = useContext(ActionsContext);
    if (context === undefined) {
        throw new Error("useActions must be used within an ActionsProvider");
    }
    return context;
};

export const ActionsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { classes } = useMainContext();
    const [selectedClassId, setSelectedClassId] = useState<string>(classes?.[0]?.id || "");
    const [selectedDate, setSelectedDayId] = useState<string>(getTomorrowOption());

    useEffect(() => {
        if (classes && classes?.length > 0 && selectedClassId === "") {
            setSelectedClassId(classes[0].id);
        }
    }, [classes]);

    const getSelectedClass = () => {
        return classes?.find((c) => c.id === selectedClassId);
    };

    const classesSelectOptions = () => {
        return createSelectOptions<ClassType>(classes);
    };

    const daysSelectOptions = () => {
        return getDayOptions();
    };

    const handleClassChange = (value: string) => {
        setSelectedClassId(value);
    };

    const handleDayChange = (value: string) => {
        setSelectedDayId(value);
    };

    const value: ActionsContextType = {
        selectedClassId,
        getSelectedClass,
        classesSelectOptions,
        daysSelectOptions,
        handleClassChange,
        selectedDate,
        handleDayChange,
    };

    return <ActionsContext.Provider value={value}>{children}</ActionsContext.Provider>;
};
