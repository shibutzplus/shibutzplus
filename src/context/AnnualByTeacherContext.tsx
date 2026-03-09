"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { WeeklySchedule, AnnualScheduleType, AnnualInputCellType, } from "@/models/types/annualSchedule";
import { useMainContext } from "./MainContext";
import { createSelectOptions } from "@/utils/format";
import { TeacherType } from "@/models/types/teachers";
import { SelectOption } from "@/models/types";
import { errorToast } from "@/lib/toast";
import messages from "@/resources/messages";
import { dayToNumber } from "@/utils/time";
import { setNewScheduleTemplate } from "@/services/annual/initialize";
import { logErrorAction } from "@/app/actions/POST/logErrorAction";
import { updateAnnualTeacherScheduleAction } from "@/app/actions/PUT/updateAnnualTeacherScheduleAction";

interface AnnualByTeacherContextType {
    selectedTeacherId?: string;
    setSelectedTeacherId: (id?: string) => void;
    annualScheduleTable: AnnualScheduleType[] | undefined;
    setAnnualScheduleTable: React.Dispatch<React.SetStateAction<AnnualScheduleType[] | undefined>>;
    schedule: WeeklySchedule;
    setSchedule: React.Dispatch<React.SetStateAction<WeeklySchedule>>;
    teachersSelectOptions: () => SelectOption[];
    handleTeacherChange: (value: string) => void;
    isSaving: boolean;
    setIsSaving: React.Dispatch<React.SetStateAction<boolean>>;
    isLoading: boolean;
    setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
    handleScheduleUpdate: (
        type: AnnualInputCellType,
        elementIds: string[],
        day: string,
        hour: number,
    ) => Promise<void>;
}

const AnnualByTeacherContext = createContext<AnnualByTeacherContextType | undefined>(undefined);

export const useAnnualByTeacher = () => {
    const context = useContext(AnnualByTeacherContext);
    if (!context) {
        throw new Error("useAnnualByTeacher must be used within an AnnualByTeacherProvider");
    }
    return context;
};

export const AnnualByTeacherProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { teachers, school } = useMainContext();
    // teacher filter state
    const [selectedTeacherId, setSelectedTeacherId] = useState<string | undefined>(undefined);
    // per-teacher schedule map: { [teacherId]: WeeklySchedule }
    const [schedule, setSchedule] = useState<WeeklySchedule>({});
    const [isSaving, setIsSaving] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const { annualScheduleTable, setAnnualScheduleTable, applyBatchAnnualScheduleUpdates } = useMainContext();

    useEffect(() => {
        const regularTeachers = teachers?.filter((t) => t.role === "regular") || [];
        if (regularTeachers.length > 0) {
            const isValid = regularTeachers.some((t) => t.id === selectedTeacherId);
            if (!isValid && selectedTeacherId) {
                setSelectedTeacherId(undefined);
            }
        }
    }, [teachers, selectedTeacherId]);

    const teachersSelectOptions = (): SelectOption[] => {
        const regularTeachers = teachers?.filter((t) => t.role === "regular") || [];
        return createSelectOptions<TeacherType>(regularTeachers);
    };

    const handleTeacherChange = (value: string) => {
        if (value) {
            setSelectedTeacherId(value);
        }
    };

    const handleScheduleUpdate = async (
        type: AnnualInputCellType,
        elementIds: string[],
        day: string,
        hour: number,
    ) => {
        if (!school?.id || !selectedTeacherId) return;

        const currentCell = schedule[selectedTeacherId]?.[day]?.[hour];
        const prevElementIds = currentCell?.[type] || [];

        let classIds = type === "classes" ? elementIds : currentCell?.classes || [];
        let subjectIds = type === "subjects" ? elementIds : currentCell?.subjects || [];

        // If the last class was removed, auto-clear the subjects as well
        if (type === "classes" && classIds.length === 0) {
            subjectIds = [];
        }

        setSchedule((prev) => {
            const newSchedule = { ...prev };
            setNewScheduleTemplate(newSchedule, selectedTeacherId, day, hour, selectedTeacherId);
            newSchedule[selectedTeacherId][day][hour][type] = elementIds;
            if (type === "classes" && elementIds.length === 0) {
                newSchedule[selectedTeacherId][day][hour]["subjects"] = [];
            }
            return newSchedule;
        });

        setIsSaving(true);
        try {
            const dayNum = dayToNumber(day);
            const response = await updateAnnualTeacherScheduleAction(
                dayNum,
                hour,
                school.id,
                selectedTeacherId,
                classIds,
                subjectIds
            );

            if (response.success) {
                const deletedIds = response.deleted ? response.deleted.map(d => d.id) : [];
                applyBatchAnnualScheduleUpdates(deletedIds, response.added || []);
            } else {
                setSchedule((prev) => {
                    const revertSchedule = { ...prev };
                    if (revertSchedule[selectedTeacherId]?.[day]?.[hour]) {
                        revertSchedule[selectedTeacherId][day][hour][type] = prevElementIds;
                        // Also revert subjects if we auto-cleared them
                        if (type === "classes" && elementIds.length === 0) {
                            revertSchedule[selectedTeacherId][day][hour]["subjects"] = currentCell?.subjects || [];
                        }
                    }
                    return revertSchedule;
                });
                errorToast(messages.annualSchedule.error);
            }
        } catch (error) {
            setSchedule((prev) => {
                const revertSchedule = { ...prev };
                if (revertSchedule[selectedTeacherId]?.[day]?.[hour]) {
                    revertSchedule[selectedTeacherId][day][hour][type] = prevElementIds;
                    if (type === "classes" && elementIds.length === 0) {
                        revertSchedule[selectedTeacherId][day][hour]["subjects"] = currentCell?.subjects || [];
                    }
                }
                return revertSchedule;
            });
            logErrorAction({
                description: `Error saving annual schedule entry: ${error instanceof Error ? error.message : String(error)}`,
                schoolId: school.id
            });
            errorToast(messages.annualSchedule.error);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <AnnualByTeacherContext.Provider
            value={{
                selectedTeacherId,
                setSelectedTeacherId,
                annualScheduleTable,
                setAnnualScheduleTable,
                schedule,
                setSchedule,
                teachersSelectOptions,
                handleTeacherChange,
                isSaving,
                setIsSaving,
                isLoading,
                setIsLoading,
                handleScheduleUpdate,
            }}
        >
            {children}
        </AnnualByTeacherContext.Provider>
    );
};
