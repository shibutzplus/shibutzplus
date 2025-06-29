"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { useMainContext } from "./MainContext";
import { createSelectOptions } from "@/utils/format";
import { ClassType } from "@/models/types/classes";
import { SelectOption } from "@/models/types";
import { dayOptions } from "@/resources/dayOptions";

interface ActionsContextType {
    selectedClassId: string;
    classesSelectOptions: () => SelectOption[];
    daysSelectOptions: () => SelectOption[];
    handleClassChange: (value: string) => void;
    selectedDayId: string;
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
    const [selectedDayId, setSelectedDayId] = useState<string>(dayOptions[0].value);

    useEffect(() => {
        if (classes && classes?.length > 0 && selectedClassId === "") {
            setSelectedClassId(classes[0].id);
        }
    }, [classes]);

    const classesSelectOptions = () => {
        return createSelectOptions<ClassType>(classes);
    };

    const daysSelectOptions = () => {
        return dayOptions;
    };

    const handleClassChange = (value: string) => {
        setSelectedClassId(value);
    };

    const handleDayChange = (value: string) => {
        setSelectedDayId(value);
    };

    const value: ActionsContextType = {
        selectedClassId,
        classesSelectOptions,
        daysSelectOptions,
        handleClassChange,
        selectedDayId,
        handleDayChange,
    };

    return <ActionsContext.Provider value={value}>{children}</ActionsContext.Provider>;
};
