"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { useMainContext } from "./MainContext";
import { createSelectOptions, sortByHebrewName } from "@/utils/format";
import { ClassType } from "@/models/types/classes";
import { SelectOption } from "@/models/types";

interface AnnualTableContextType {
    selectedClassId: string;
    getSelectedClass: () => ClassType | undefined;
    classesSelectOptions: () => SelectOption[];
    handleClassChange: (value: string) => void;
    setIsSaving: React.Dispatch<React.SetStateAction<boolean>>;
    isSaving: boolean;
    setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
    isLoading: boolean;
}

const AnnualTableContext = createContext<AnnualTableContextType | undefined>(undefined);

export const useAnnualTable = () => {
    const context = useContext(AnnualTableContext);
    if (context === undefined) {
        throw new Error("useAnnualTable must be used within an AnnualTableProvider");
    }
    return context;
};

export const AnnualTableProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { classes } = useMainContext();
    const [selectedClassId, setSelectedClassId] = useState<string>(classes?.[0]?.id || "");
    const [isSaving, setIsSaving] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    useEffect(() => {
        if (classes && classes?.length > 0 && selectedClassId === "") {
            setSelectedClassId(classes[0].id);
        }
    }, [classes]);

    const getSelectedClass = () => {
        return classes?.find((c) => c.id === selectedClassId);
    };

    const classesSelectOptions = () => {
        return createSelectOptions<ClassType>(sortByHebrewName(classes || []));
    };

    const handleClassChange = (value: string) => {
        setSelectedClassId(value);
    };

    const value: AnnualTableContextType = {
        selectedClassId,
        getSelectedClass,
        classesSelectOptions,
        handleClassChange,
        setIsSaving,
        isSaving,
        setIsLoading,
        isLoading,
    };

    return <AnnualTableContext.Provider value={value}>{children}</AnnualTableContext.Provider>;
};
