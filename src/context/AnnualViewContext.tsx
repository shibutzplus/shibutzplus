"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useMainContext } from "./MainContext";
import { createSelectOptions } from "@/utils/format";
import { compareHebrew, sortByName } from "@/utils/sort";
import { ClassType } from "@/models/types/classes";
import { TeacherType, TeacherRoleValues } from "@/models/types/teachers";
import { AnnualScheduleType, WeeklySchedule } from "@/models/types/annualSchedule";
import { populateAllClassesSchedule, populateAllTeachersSchedule } from "@/services/annual/populate";
import { initializeEmptyAnnualSchedule } from "@/services/annual/initialize";

interface AnnualViewContextType {
    annualScheduleTable: AnnualScheduleType[] | undefined;
    selectedClassId: string;
    setSelectedClassId: React.Dispatch<React.SetStateAction<string>>;
    selectedTeacherId: string;
    setSelectedTeacherId: React.Dispatch<React.SetStateAction<string>>;
    schedule: WeeklySchedule;
    isLoading: boolean;
    handleClassChange: (value: string) => void;
    handleTeacherChange: (value: string) => void;
    classesSelectOptions: () => { value: string; label: string }[];
    teachersSelectOptions: () => { value: string; label: string }[];
    setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

const AnnualViewContext = createContext<AnnualViewContextType | undefined>(undefined);

export const useAnnualView = () => {
    const context = useContext(AnnualViewContext);
    if (!context) {
        throw new Error("useAnnualView must be used within an AnnualViewProvider");
    }
    return context;
};

export const AnnualViewProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { classes, school, teachers, annualScheduleTable } = useMainContext();
    const [selectedClassId, setSelectedClassId] = useState<string>("");
    const [selectedTeacherId, setSelectedTeacherId] = useState<string>("");
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [schedule, setSchedule] = useState<WeeklySchedule>({});

    const searchParams = useSearchParams();

    // Read initial selections from search parameters (e.g. ?classId=... or ?teacherId=...)
    useEffect(() => {
        const teacherId = searchParams.get("teacherId") || searchParams.get("id");
        if (teacherId && teachers && teachers.length > 0) {
            const regularTeachers = teachers.filter((t) => t.role === TeacherRoleValues.REGULAR);
            const isValid = regularTeachers.some((t) => t.id === teacherId);
            if (isValid) {
                setSelectedTeacherId(teacherId);
            }
        }
        const classId = searchParams.get("classId");
        if (classId && classes && classes.length > 0) {
            const isValid = classes.some((c) => c.id === classId);
            if (isValid) {
                setSelectedClassId(classId);
            }
        }
    }, [searchParams, teachers, classes]);

    // Populate schedule based on selection
    useEffect(() => {
        if (!annualScheduleTable || (!selectedClassId && !selectedTeacherId)) {
            setSchedule({});
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        let newSchedule: WeeklySchedule = {};

        if (selectedClassId && !selectedTeacherId) {
            // Only Class selected: Populate like AnnualClass
            newSchedule = initializeEmptyAnnualSchedule({}, selectedClassId, school?.fromHour ?? 1, school?.toHour ?? 10);
            newSchedule = populateAllClassesSchedule(annualScheduleTable, newSchedule);
        } else if (!selectedClassId && selectedTeacherId) {
            // Only Teacher selected: Populate like AnnualTeacher
            newSchedule = initializeEmptyAnnualSchedule({}, selectedTeacherId, school?.fromHour ?? 1, school?.toHour ?? 10);
            newSchedule = populateAllTeachersSchedule(annualScheduleTable, newSchedule);
        } else if (selectedClassId && selectedTeacherId) {
            // Both selected: We use Class structure as the base and filter by teacher in the cell
            newSchedule = initializeEmptyAnnualSchedule({}, selectedClassId, school?.fromHour ?? 1, school?.toHour ?? 10);
            newSchedule = populateAllClassesSchedule(annualScheduleTable, newSchedule);
        }

        setSchedule(newSchedule);
        setIsLoading(false);
    }, [selectedClassId, selectedTeacherId, annualScheduleTable, school]);

    const classesSelectOptions = () => {
        const sortedClasses = [...(classes || [])].sort((a, b) => {
            if (a.activity !== b.activity) {
                return a.activity ? 1 : -1;
            }
            return compareHebrew(a.name, b.name);
        });
        return createSelectOptions<ClassType>(sortedClasses);
    };

    const teachersSelectOptions = () => {
        const sortedTeachers = [...(teachers || [])]
            .filter((t) => t.role === TeacherRoleValues.REGULAR)
            .sort(sortByName);
        return createSelectOptions<TeacherType>(sortedTeachers);
    };

    const handleClassChange = (value: string) => {
        setSelectedClassId(value);
    };

    const handleTeacherChange = (value: string) => {
        setSelectedTeacherId(value);
    };

    return (
        <AnnualViewContext.Provider
            value={{
                annualScheduleTable,
                selectedClassId,
                setSelectedClassId,
                selectedTeacherId,
                setSelectedTeacherId,
                schedule,
                isLoading,
                handleClassChange,
                handleTeacherChange,
                classesSelectOptions,
                teachersSelectOptions,
                setIsLoading,
            }}
        >
            {children}
        </AnnualViewContext.Provider>
    );
};
