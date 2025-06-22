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
    });

    const setSchoolIdInStorage = (id: string) => {
        if (typeof window !== "undefined") {
            localStorage.setItem(STORAGE_KEYS.SCHOOL_ID, id);
        }
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
    };

    return <MainContext.Provider value={value}>{children}</MainContext.Provider>;
};
