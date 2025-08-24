"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { useMainContext } from "./MainContext";
import { createSelectOptions, sortByHebrewName } from "@/utils/format";
import { ClassType } from "@/models/types/classes";
import { SelectOption } from "@/models/types";
import { AnnualScheduleRequest } from "@/models/types/annualSchedule";
import { errorToast } from "@/lib/toast";
import messages from "@/resources/messages";
import { getUniqueCells } from "@/services/ annualScheduleService";

interface AnnualTableContextType {
    selectedClassId: string;
    getSelectedClass: () => ClassType | undefined;
    classesSelectOptions: () => SelectOption[];
    addToQueue: (rows: AnnualScheduleRequest[]) => void;
    handleClassChange: (value: string) => void;
    setIsSaving: React.Dispatch<React.SetStateAction<boolean>>;
    handleSave: () => Promise<void>;
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
    const { classes, school, deleteAnnualScheduleItem, addNewAnnualScheduleItem } =
        useMainContext();
    const [selectedClassId, setSelectedClassId] = useState<string>(classes?.[0]?.id || "");
    const [isSaving, setIsSaving] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const [queueRows, setQueueRows] = useState<AnnualScheduleRequest[]>([]);

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

    const addToQueue = (rows: AnnualScheduleRequest[]) => {
        // TODO: edge case -> 1 subject, 1 teacher -> delete one or both not updated in the DB
        setQueueRows((prev) => Array.isArray(prev) ? [...prev, ...rows] : [...rows]);
    };


    const handleSave = async () => {
        setIsSaving(true);
        console.log("queueRows", queueRows);
        if (queueRows.length === 0 || !school?.id) {
            setIsSaving(false);
            return;
        }

        try {
            const cells = queueRows.map((row) => ({
                day: row.day,
                hour: row.hour,
            }));
            const uniqueCells = cells.filter(
                (cell, index) =>
                    cells.findIndex((c) => c.day === cell.day && c.hour === cell.hour) === index,
            );

            for (const cell of uniqueCells) {
                await deleteAnnualScheduleItem(cell.day, cell.hour, selectedClassId, school.id);
            }
            for (const row of queueRows) {
                await addNewAnnualScheduleItem(row);
            }
        } catch (error) {
            console.error("Error deleting annual schedule entry:", error);
            errorToast(messages.annualSchedule.error);
        } finally {
            setQueueRows([]);
            setIsSaving(false);
        }
    };

    const value: AnnualTableContextType = {
        selectedClassId,
        getSelectedClass,
        classesSelectOptions,
        handleClassChange,
        addToQueue,
        handleSave,
        setIsSaving,
        isSaving,
        setIsLoading,
        isLoading,
    };

    return <AnnualTableContext.Provider value={value}>{children}</AnnualTableContext.Provider>;
};
