"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { WeeklySchedule, AnnualScheduleType, AnnualInputCellType, AnnualScheduleRequest, } from "@/models/types/annualSchedule";
import { useMainContext } from "./MainContext";
import { createSelectOptions } from "@/utils/format";
import { TeacherType } from "@/models/types/teachers";
import { Pair, SelectOption } from "@/models/types";
import useInitAnnualData from "@/hooks/useInitAnnualData";
import { SelectMethod } from "@/models/types/actions";
import { SubjectType } from "@/models/types/subjects";
import { addAnnualScheduleAction } from "@/app/actions/POST/addAnnualScheduleAction";
import { deleteAnnualByTeacherAction } from "@/app/actions/DELETE/deleteAnnualByTeacherAction";
import { errorToast } from "@/lib/toast";
import messages from "@/resources/messages";
import { dayToNumber } from "@/utils/time";
import { createAnnualByTeacherRequests, createClassSubjectPairs, setNewScheduleTemplate, } from "@/services/annual/initialize";
import { getSelectedTeacher } from "@/services/annual/get";

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
    handleAddNewRow: (
        type: AnnualInputCellType,
        elementIds: string[],
        day: string,
        hour: number,
        method: SelectMethod,
        newElementObj?: any, // Using any here to match the signature flexibility needed, or specify TeacherType | SubjectType | ClassType
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
    const { teachers, school, subjects, classes } = useMainContext();
    // teacher filter state
    const [selectedTeacherId, setSelectedTeacherId] = useState<string | undefined>(undefined);
    // per-teacher schedule map: { [teacherId]: WeeklySchedule }
    const [schedule, setSchedule] = useState<WeeklySchedule>({});
    const [isSaving, setIsSaving] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [annualScheduleTable, setAnnualScheduleTable] = useState<
        AnnualScheduleType[] | undefined
    >(undefined);
    const [queueRows, setQueueRows] = useState<AnnualScheduleRequest[]>([]);

    useInitAnnualData({
        annualScheduleTable,
        setAnnualScheduleTable,
        schoolId: school?.id,
    });

    // Initialize with first teacher
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

    useEffect(() => {
        if (queueRows.length > 0) {
            handleSave();
        }
    }, [queueRows]);

    const addNewAnnualScheduleItem = async (newScheduleItem: AnnualScheduleRequest) => {
        const response = await addAnnualScheduleAction(newScheduleItem);
        if (response.success && response.data) {
            setAnnualScheduleTable((prev) => {
                if (!response.data) return prev;
                const updatedSchedule = prev ? [...prev, response.data] : [response.data];
                return updatedSchedule;
            });
            return response.data;
        }
        return undefined;
    };

    const deleteAnnualScheduleItem = async (
        day: number,
        hour: number,
        teacherId: string,
        schoolId: string,
    ) => {
        if (!school?.id) return;
        const response = await deleteAnnualByTeacherAction(day, hour, teacherId, schoolId);
        if (response.success && response.deleted) {
            const deletedIds = response.deleted.map((item) => item.id);
            setAnnualScheduleTable((prev) => {
                const updatedSchedule = prev?.filter((item) => !deletedIds.includes(item.id));
                return updatedSchedule;
            });
            return response.deleted;
        }
        return undefined;
    };

    const handleTeacherChange = (value: string) => {
        if (value) {
            setSelectedTeacherId(value);
        }
    };

    const addToQueue = (rows: AnnualScheduleRequest[]) => {
        setQueueRows((prev) => (Array.isArray(prev) ? [...prev, ...rows] : [...rows]));
    };

    const handleSave = async () => {
        setIsSaving(true);
        if (queueRows.length === 0 || !school?.id) {
            setIsSaving(false);
            return;
        }

        try {
            // Collect unique (teacherId + day + hour) tuples to delete safely
            const uniqueCellsMap = new Map<
                string,
                { day: number; hour: number; teacherId: string }
            >();
            for (const row of queueRows) {
                const key = `${row.teacher?.id}_${row.day}_${row.hour}`;
                if (!uniqueCellsMap.has(key) && row.teacher?.id) {
                    uniqueCellsMap.set(key, {
                        day: row.day,
                        hour: row.hour,
                        teacherId: row.teacher.id,
                    });
                }
            }

            for (const { day, hour, teacherId } of uniqueCellsMap.values()) {
                await deleteAnnualScheduleItem(day, hour, teacherId, school.id);
            }

            for (const row of queueRows) {
                await addNewAnnualScheduleItem(row);
            }
        } catch (error) {
            console.error("Error saving annual schedule entry:", error);
            errorToast(messages.annualSchedule.error);
        } finally {
            setQueueRows([]);
            setIsSaving(false);
        }
    };

    const handleAddNewRow = async (
        type: AnnualInputCellType,
        elementIds: string[],
        day: string,
        hour: number,
        method: SelectMethod,
        newElementObj?: any,
    ) => {
        if (!school?.id || !selectedTeacherId) return;
        const newSchedule = { ...schedule };

        setNewScheduleTemplate(newSchedule, selectedTeacherId, day, hour, selectedTeacherId);

        newSchedule[selectedTeacherId][day][hour][type] = elementIds;

        const classIds = newSchedule[selectedTeacherId][day][hour].classes;
        const subjectIds = newSchedule[selectedTeacherId][day][hour].subjects;
        setSchedule(newSchedule);

        // 1) Handle deletions first
        if (method === "remove-value" || method === "clear") {
            const dayNum = dayToNumber(day);
            // If class or subjects are removed, we clear the cell for this teacher
            if (classIds.length === 0 || subjectIds.length === 0) {
                await deleteAnnualScheduleItem(dayNum, hour, selectedTeacherId, school.id);
                return; // stop here
            }
        }

        // 2) Incomplete data → do nothing yet
        if (classIds.length === 0 || subjectIds.length === 0) {
            return;
        }

        // Create
        let subjectsList = [...(subjects || [])];
        if (method === "create-option" && newElementObj && type === "subjects") {
            subjectsList = [newElementObj as SubjectType];
        }

        const pairs: Pair[] = createClassSubjectPairs(classIds, subjectIds);
        const selectedTeacherObj = getSelectedTeacher(teachers, selectedTeacherId);
        const requests: AnnualScheduleRequest[] = createAnnualByTeacherRequests(
            selectedTeacherObj,
            school,
            classes,
            subjectsList,
            pairs,
            day,
            hour,
        );
        addToQueue(requests);
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
                handleAddNewRow,
            }}
        >
            {children}
        </AnnualByTeacherContext.Provider>
    );
};
