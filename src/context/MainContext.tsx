"use client";

import { SchoolType } from "@/models/types/school";
import { TeacherType } from "@/models/types/teachers";
import { SubjectType } from "@/models/types/subjects";
import { ClassType } from "@/models/types/classes";
import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { AnnualScheduleType } from "@/models/types/annualSchedule";
import { useSchoolData } from "@/hooks/useSchoolData";
import { useSession } from "next-auth/react";
import { STORAGE_KEYS } from "@/resources/storage";

interface MainContextType {
    school: SchoolType | undefined;
    teachers: TeacherType[] | undefined;
    subjects: SubjectType[] | undefined;
    classes: ClassType[] | undefined;
    annualScheduleTable: AnnualScheduleType[] | undefined;
    isLoading: boolean;
    error: string | null;
    setSchoolIdInStorage: (id: string) => void;
    updateClasses: (newClass: ClassType) => void;
    deleteClass: (classId: string) => void;
    updateTeachers: (newTeacher: TeacherType) => void;
    updateSubjects: (newSubject: SubjectType) => void;
    updateAnnualSchedule: (newScheduleItem: AnnualScheduleType) => void;
    updateExistingAnnualSchedule: (updatedScheduleItem: AnnualScheduleType) => void;
}

const MainContext = createContext<MainContextType | undefined>(undefined);

export const useMainContext = () => {
    const context = useContext(MainContext);
    if (context === undefined) {
        throw new Error("useMainContext must be used within a MainContextProvider");
    }
    return context;
};

interface MainContextProviderProps {
    children: ReactNode;
}

export const MainContextProvider: React.FC<MainContextProviderProps> = ({ children }) => {
    const { data: session } = useSession();
    const [school, setSchool] = useState<SchoolType | undefined>(undefined);
    const [teachers, setTeachers] = useState<TeacherType[] | undefined>(undefined);
    const [subjects, setSubjects] = useState<SubjectType[] | undefined>(undefined);
    const [classes, setClasses] = useState<ClassType[] | undefined>(undefined);
    const [annualScheduleTable, setAnnualScheduleTable] = useState<
        AnnualScheduleType[] | undefined
    >(undefined);

    const { isLoading, error } = useSchoolData({
        setSchool,
        setTeachers,
        setSubjects,
        setClasses,
        setAnnualScheduleTable,
    });

    const setSchoolIdInStorage = (id: string) => {
        localStorage.setItem(STORAGE_KEYS.SCHOOL_ID, id);
    };

    const updateClasses = (newClass: ClassType) => {
        setClasses((prev) => {
            const updatedClasses = prev ? [...prev, newClass] : [newClass];
            if (typeof window !== "undefined") {
                localStorage.setItem(STORAGE_KEYS.CLASSES_DATA, JSON.stringify(updatedClasses));
            }
            return updatedClasses;
        });
    };
    
    const deleteClass = (classId: string) => {
        setClasses((prev) => {
            if (!prev) return prev;
            const updatedClasses = prev.filter(c => c.id !== classId);
            if (typeof window !== "undefined") {
                localStorage.setItem(STORAGE_KEYS.CLASSES_DATA, JSON.stringify(updatedClasses));
            }
            return updatedClasses;
        });
    };

    const updateTeachers = (newTeacher: TeacherType) => {
        setTeachers((prev) => {
            const updatedTeachers = prev ? [...prev, newTeacher] : [newTeacher];
            if (typeof window !== "undefined") {
                localStorage.setItem(STORAGE_KEYS.TEACHERS_DATA, JSON.stringify(updatedTeachers));
            }
            return updatedTeachers;
        });
    };

    const updateSubjects = (newSubject: SubjectType) => {
        setSubjects((prev) => {
            const updatedSubjects = prev ? [...prev, newSubject] : [newSubject];
            if (typeof window !== "undefined") {
                localStorage.setItem(STORAGE_KEYS.SUBJECTS_DATA, JSON.stringify(updatedSubjects));
            }
            return updatedSubjects;
        });
    };

    const updateAnnualSchedule = (newScheduleItem: AnnualScheduleType) => {
        setAnnualScheduleTable((prev) => {
            const updatedSchedule = prev ? [...prev, newScheduleItem] : [newScheduleItem];
            if (typeof window !== "undefined") {
                localStorage.setItem(STORAGE_KEYS.ANNUAL_SCHEDULE_DATA, JSON.stringify(updatedSchedule));
            }
            return updatedSchedule;
        });
    };
    
    const updateExistingAnnualSchedule = (updatedScheduleItem: AnnualScheduleType) => {
        setAnnualScheduleTable((prev) => {
            if (!prev) return [updatedScheduleItem];
            
            const updatedSchedule = prev.map(item => 
                item.id === updatedScheduleItem.id ? updatedScheduleItem : item
            );
            
            if (typeof window !== "undefined") {
                localStorage.setItem(STORAGE_KEYS.ANNUAL_SCHEDULE_DATA, JSON.stringify(updatedSchedule));
            }
            return updatedSchedule;
        });
    };

    useEffect(() => {
        // Initialize school ID from user session if available
        if (session?.user?.schoolId && typeof window !== "undefined") {
            const storedSchoolId = localStorage.getItem(STORAGE_KEYS.SCHOOL_ID);
            if (!storedSchoolId) {
                setSchoolIdInStorage(session.user.schoolId);
            }
        }
    }, [session]);

    const value: MainContextType = {
        school,
        teachers,
        subjects,
        classes,
        annualScheduleTable,
        isLoading,
        error,
        setSchoolIdInStorage,
        updateClasses,
        deleteClass,
        updateTeachers,
        updateSubjects,
        updateAnnualSchedule,
        updateExistingAnnualSchedule,
    };

    return <MainContext.Provider value={value}>{children}</MainContext.Provider>;
};
