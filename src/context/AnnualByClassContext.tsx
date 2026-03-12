"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { useMainContext } from "./MainContext";
import { createSelectOptions } from "@/utils/format";
import { ClassType } from "@/models/types/classes";
import { AnnualInputCellType, AnnualScheduleType, WeeklySchedule, } from "@/models/types/annualSchedule";
import { errorToast } from "@/lib/toast";
import messages from "@/resources/messages";
import { dayToNumber } from "@/utils/time";
import { setNewScheduleTemplate, } from "@/services/annual/initialize";
import { logErrorAction } from "@/app/actions/POST/logErrorAction";
import { updateAnnualClassScheduleAction } from "@/app/actions/PUT/updateAnnualClassScheduleAction";

interface AnnualByClassContextType {
    annualScheduleTable: AnnualScheduleType[] | undefined;
    setAnnualScheduleTable: React.Dispatch<React.SetStateAction<AnnualScheduleType[] | undefined>>;
    selectedClassId: string;
    setSelectedClassId: React.Dispatch<React.SetStateAction<string>>;
    schedule: WeeklySchedule;
    setSchedule: React.Dispatch<React.SetStateAction<WeeklySchedule>>;
    isLoading: boolean;
    setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
    isSaving: boolean;
    setIsSaving: React.Dispatch<React.SetStateAction<boolean>>;
    handleClassChange: (value: string) => void;
    classesSelectOptions: () => { value: string; label: string }[];
    handleScheduleUpdate: (
        type: AnnualInputCellType,
        elementIds: string[],
        day: string,
        hour: number,
    ) => Promise<void>;
}

const AnnualByClassContext = createContext<AnnualByClassContextType | undefined>(undefined);

export const useAnnualByClass = () => {
    const context = useContext(AnnualByClassContext);
    if (!context) {
        throw new Error("useAnnualByClass must be used within an AnnualByClassProvider");
    }
    return context;
};

export const AnnualByClassProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { classes, school } = useMainContext();
    const [selectedClassId, setSelectedClassId] = useState<string>("");
    const [isSaving, setIsSaving] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const {
        annualScheduleTable,
        setAnnualScheduleTable,
        applyBatchAnnualScheduleUpdates
    } = useMainContext();
    const [schedule, setSchedule] = useState<WeeklySchedule>({});

    useEffect(() => {
        if (classes && classes.length > 0) {
            const isValid = classes.some((c) => c.id === selectedClassId);
            if (!isValid && selectedClassId !== "") {
                setSelectedClassId("");
            }
        }
    }, [classes, selectedClassId]);

    const classesSelectOptions = () => {
        return createSelectOptions<ClassType>(classes || []);
    };

    const handleClassChange = (value: string) => {
        if (value) {
            setSelectedClassId(value);
        }
    };

    const handleScheduleUpdate = async (
        type: AnnualInputCellType,
        elementIds: string[],
        day: string,
        hour: number,
    ) => {
        if (!school?.id || !selectedClassId) return;

        const currentCell = schedule[selectedClassId]?.[day]?.[hour];
        const prevElementIds = currentCell?.[type] || [];

        const teacherIds = type === "teachers" ? elementIds : currentCell?.teachers || [];
        let subjectIds = type === "subjects" ? elementIds : currentCell?.subjects || [];

        // If the last teacher was removed, auto-clear the subjects as well
        if (type === "teachers" && teacherIds.length === 0) {
            subjectIds = [];
        }

        setSchedule((prev) => {
            let newSchedule = { ...prev };
            newSchedule = setNewScheduleTemplate(newSchedule, selectedClassId, day, hour);
            newSchedule[selectedClassId][day][hour][type] = elementIds;
            if (type === "teachers" && elementIds.length === 0) {
                newSchedule[selectedClassId][day][hour]["subjects"] = [];
            }
            return newSchedule;
        });

        setIsSaving(true);
        try {
            const dayNum = dayToNumber(day);
            const response = await updateAnnualClassScheduleAction(
                dayNum,
                hour,
                school.id,
                selectedClassId,
                teacherIds,
                subjectIds
            );

            if (response.success) {
                const deletedIds = response.deleted ? response.deleted.map(d => d.id) : [];
                applyBatchAnnualScheduleUpdates(deletedIds, response.added || []);
            } else {
                setSchedule((prev) => {
                    const revertSchedule = { ...prev };
                    if (revertSchedule[selectedClassId]?.[day]?.[hour]) {
                        revertSchedule[selectedClassId][day][hour][type] = prevElementIds;
                        // Also revert subjects if we auto-cleared them
                        if (type === "teachers" && elementIds.length === 0) {
                            revertSchedule[selectedClassId][day][hour]["subjects"] = currentCell?.subjects || [];
                        }
                    }
                    return revertSchedule;
                });
                errorToast(messages.annualSchedule.error);
            }
        } catch (error) {
            setSchedule((prev) => {
                const revertSchedule = { ...prev };
                if (revertSchedule[selectedClassId]?.[day]?.[hour]) {
                    revertSchedule[selectedClassId][day][hour][type] = prevElementIds;
                    if (type === "teachers" && elementIds.length === 0) {
                        revertSchedule[selectedClassId][day][hour]["subjects"] = currentCell?.subjects || [];
                    }
                }
                return revertSchedule;
            });
            logErrorAction({
                description: `Error saving annual schedule entry (by class): ${error instanceof Error ? error.message : String(error)}`,
                schoolId: school.id
            });
            errorToast(messages.annualSchedule.error);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <AnnualByClassContext.Provider
            value={{
                annualScheduleTable,
                setAnnualScheduleTable,
                selectedClassId,
                setSelectedClassId,
                schedule,
                setSchedule,
                isLoading,
                setIsLoading,
                isSaving,
                setIsSaving,
                handleClassChange,
                classesSelectOptions,
                handleScheduleUpdate,
            }}
        >
            {children}
        </AnnualByClassContext.Provider>
    );
};
