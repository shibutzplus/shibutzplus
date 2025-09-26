"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { useMainContext } from "./MainContext";
import { createSelectOptions } from "@/utils/format";
import { ClassType } from "@/models/types/classes";
import { Pair, SelectOption } from "@/models/types";
import {
    AnnualScheduleRequest,
    AnnualScheduleType,
    WeeklySchedule,
} from "@/models/types/annualSchedule";
import { errorToast, infoToast } from "@/lib/toast";
import messages from "@/resources/messages";
import { addAnnualScheduleAction } from "@/app/actions/POST/addAnnualScheduleAction";
import { deleteAnnualScheduleAction } from "@/app/actions/DELETE/deleteAnnualScheduleAction";
import useInitAnnualData from "@/hooks/useInitAnnualData";
import { SelectMethod } from "@/models/types/actions";
import {
    createPairs,
    createAnnualRequests,
    setNewScheduleTemplate,
    getUniqueCellsFromQueue,
    getSelectedClass,
} from "@/services/annualScheduleService";
import { dayToNumber } from "@/utils/time";
import { TeacherType } from "@/models/types/teachers";
import { SubjectType } from "@/models/types/subjects";
import { sortByHebrewName } from "@/utils/sort";

interface AnnualTableContextType {
    annualScheduleTable: AnnualScheduleType[] | undefined;
    selectedClassId: string;
    isLoading: boolean;
    setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
    classesSelectOptions: () => SelectOption[];
    handleClassChange: (value: string) => void;
    setIsSaving: React.Dispatch<React.SetStateAction<boolean>>;
    isSaving: boolean;
    schedule: WeeklySchedule;
    setSchedule: React.Dispatch<React.SetStateAction<WeeklySchedule>>;
    handleAddNewRow: (
        type: "teachers" | "subjects",
        elementIds: string[],
        day: string,
        hour: number,
        method: SelectMethod,
        newElementObj?: TeacherType | SubjectType,
    ) => Promise<void>;

    teachersSelectOptions: () => SelectOption[];
    selectedTeacherId: string;
    handleTeacherChange: (value: string) => void;
    canShowTable: boolean;
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
    const { classes, school, teachers, subjects, annualAfterDelete } = useMainContext();
    const [selectedClassId, setSelectedClassId] = useState<string>(classes?.[0]?.id || "");
    const [isSaving, setIsSaving] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [annualScheduleTable, setAnnualScheduleTable] = useState<
        AnnualScheduleType[] | undefined
    >(undefined);

    const [queueRows, setQueueRows] = useState<AnnualScheduleRequest[]>([]);
    const [schedule, setSchedule] = useState<WeeklySchedule>({});
    const [selectedTeacherId, setSelectedTeacherId] = useState<string>("");

    useInitAnnualData({
        annualScheduleTable,
        setAnnualScheduleTable,
    });

    useEffect(() => {
        if (classes && classes?.length > 0 && selectedClassId === "") {
            setSelectedClassId(classes[0].id);
        }
    }, [classes]);

    useEffect(() => {
        if (annualAfterDelete) {
            setAnnualScheduleTable(annualAfterDelete);
        }
    }, [annualAfterDelete]);

    useEffect(() => {
        if (queueRows.length > 0) {
            handleSave();
        }
    }, [queueRows]);

    const classesSelectOptions = () => {
        const opts = createSelectOptions<ClassType>(sortByHebrewName(classes || []));
        return [{ value: "", label: "כל הכיתות" }, ...opts];
    };

    const teachersSelectOptions = () => {
        const regular = (teachers || []).filter((t) => t.role === "regular");
        return createSelectOptions<TeacherType>(sortByHebrewName(regular));
    };

    const handleTeacherChange = (value: string) => {
        setSelectedTeacherId(value || "");
    };

    const teachersSelectOptions = () => {
        const regular = (teachers || []).filter((t) => t.role === "regular");
        return createSelectOptions<TeacherType>(sortByHebrewName(regular));
    };

    const handleTeacherChange = (value: string) => {
        setSelectedTeacherId(value || "");
    };

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
        classId: string,
        schoolId: string,
    ) => {
        if (!school?.id) return;
        const response = await deleteAnnualScheduleAction(day, hour, classId, schoolId);
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

    const handleClassChange = (value: string) => {
        setSelectedClassId(value || "");
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
            const uniqueCells = getUniqueCellsFromQueue(queueRows);
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

    const handleAddNewRow = async (
        type: "teachers" | "subjects",
        elementIds: string[],
        day: string,
        hour: number,
        method: SelectMethod,
        newElementObj?: TeacherType | SubjectType,
    ) => {
        if (!school?.id) return;
        let newSchedule = { ...schedule };
        newSchedule = setNewScheduleTemplate(newSchedule, selectedClassId, day, hour);

        newSchedule[selectedClassId][day][hour][type] = elementIds;
        const teacherIds = schedule[selectedClassId][day][hour].teachers;
        const subjectIds = schedule[selectedClassId][day][hour].subjects;
        setSchedule(newSchedule);

        if (subjectIds.length === 0 && teacherIds.length === 0) return;
        if (subjectIds.length === 0 || teacherIds.length === 0) {
            if (method === "remove-value") {
                const dayNum = dayToNumber(day);
                await deleteAnnualScheduleItem(dayNum, hour, selectedClassId, school.id);
            }
            return;
        }
        if (subjectIds.length > teacherIds.length) {
            infoToast("שימו ❤️, יש יותר מקצועות ממורים בשיעור אחד.");
            return;
        }

        let teachersList = [...(teachers || [])];
        let subjectsList = [...(subjects || [])];
        if (method === "create-option" && newElementObj) {
            teachersList = type === "teachers" ? [newElementObj as TeacherType] : teachers || [];
            subjectsList = type === "subjects" ? [newElementObj as SubjectType] : subjects || [];
        }
        const pairs: Pair[] = createPairs(teacherIds, subjectIds);
        const selectedClassObj = getSelectedClass(classes, selectedClassId);
        const requests: AnnualScheduleRequest[] = createAnnualRequests(
            selectedClassObj,
            school,
            teachersList,
            subjectsList,
            pairs,
            day,
            hour,
        );
        addToQueue(requests);
    };

    // guard: show table only if at least class selected (not "all") OR teacher selected
    const canShowTable = (selectedClassId !== "") || !!selectedTeacherId;

    const value: AnnualTableContextType = {
        annualScheduleTable,
        selectedClassId,
        classesSelectOptions,
        handleClassChange,
        setIsSaving,
        isSaving,
        setIsLoading,
        isLoading,
        schedule,
        setSchedule,
        handleAddNewRow,
        teachersSelectOptions,
        selectedTeacherId,
        handleTeacherChange,
        canShowTable,
    };

    return <AnnualTableContext.Provider value={value}>{children}</AnnualTableContext.Provider>;
};
