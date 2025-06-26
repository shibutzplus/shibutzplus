"use client";

import { SchoolType } from "@/models/types/school";
import { TeacherRequest, TeacherType } from "@/models/types/teachers";
import { SubjectRequest, SubjectType } from "@/models/types/subjects";
import { ClassRequest, ClassType } from "@/models/types/classes";
import React, { createContext, useContext, useState, ReactNode } from "react";
import { AnnualScheduleRequest, AnnualScheduleType } from "@/models/types/annualSchedule";
import { addClassAction } from "@/app/actions/addClassAction";
import { addTeacherAction } from "@/app/actions/addTeacherAction";
import { addSubjectAction } from "@/app/actions/addSubjectAction";
import { updateAnnualScheduleAction } from "@/app/actions/updateAnnualScheduleAction";
import { addAnnualScheduleAction } from "@/app/actions/addAnnualScheduleAction";
import useInitData from "@/hooks/useInitData";
import { setStorageClasses, setStorageSubjects, setStorageTeachers } from "@/utils/localStorage";

interface MainContextType {
    school: SchoolType | undefined;
    teachers: TeacherType[] | undefined;
    subjects: SubjectType[] | undefined;
    classes: ClassType[] | undefined;
    annualScheduleTable: AnnualScheduleType[] | undefined;
    addNewClass: (newClass: ClassRequest) => Promise<string>;
    deleteClass: (classId: string) => void;
    addNewTeacher: (newTeacher: TeacherRequest) => Promise<string>;
    deleteTeacher: (teacherId: string) => void;
    addNewSubject: (newSubject: SubjectRequest) => Promise<string>;
    deleteSubject: (subjectId: string) => void;
    addNewAnnualScheduleItem: (newScheduleItem: AnnualScheduleRequest) => Promise<string>;
    updateExistingAnnualScheduleItem: (
        id: string,
        updatedScheduleItem: AnnualScheduleRequest,
    ) => Promise<string>;
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
    const [school, setSchool] = useState<SchoolType | undefined>(undefined);
    const [teachers, setTeachers] = useState<TeacherType[] | undefined>(undefined);
    const [subjects, setSubjects] = useState<SubjectType[] | undefined>(undefined);
    const [classes, setClasses] = useState<ClassType[] | undefined>(undefined);
    const [annualScheduleTable, setAnnualScheduleTable] = useState<
        AnnualScheduleType[] | undefined
    >(undefined);

    useInitData({
        school,
        setSchool,
        teachers,
        setTeachers,
        subjects,
        setSubjects,
        classes,
        setClasses,
        annualScheduleTable,
        setAnnualScheduleTable,
    });

    const addNewClass = async (newClass: ClassRequest) => {
        const response = await addClassAction(newClass);
        if (response.success && response.data) {
            setClasses((prev) => {
                if (!response.data) return prev;
                const updatedClasses = prev ? [...prev, response.data] : [response.data];
                setStorageClasses(updatedClasses);
                return updatedClasses;
            });
        }
        //error msg alert
        return response.message;
    };

    const deleteClass = (classId: string) => {
        // deleteClassAction
        setClasses((prev) => {
            if (!prev) return prev;
            const updatedClasses = prev.filter((c) => c.id !== classId);
            setStorageClasses(updatedClasses);
            return updatedClasses;
        });
    };

    const addNewTeacher = async (newTeacher: TeacherRequest) => {
        const response = await addTeacherAction(newTeacher);
        if (response.success && response.data) {
            setTeachers((prev) => {
                if (!response.data) return prev;
                const updatedTeachers = prev ? [...prev, response.data] : [response.data];
                setStorageTeachers(updatedTeachers);
                return updatedTeachers;
            });
        }
        //error msg alert
        return response.message;
    };

    const deleteTeacher = (teacherId: string) => {
        // deleteTeacherAction
        setTeachers((prev) => {
            if (!prev) return prev;
            const updatedTeachers = prev.filter((t) => t.id !== teacherId);
            setStorageTeachers(updatedTeachers);
            return updatedTeachers;
        });
    };

    const addNewSubject = async (newSubject: SubjectRequest) => {
        const response = await addSubjectAction(newSubject);
        if (response.success && response.data) {
            setSubjects((prev) => {
                if (!response.data) return prev;
                const updatedSubjects = prev ? [...prev, response.data] : [response.data];
                setStorageSubjects(updatedSubjects);
                return updatedSubjects;
            });
        }
        //error msg alert
        return response.message;
    };

    const deleteSubject = (subjectId: string) => {
        // deleteSubjectAction
        setSubjects((prev) => {
            if (!prev) return prev;
            const updatedSubjects = prev.filter((s) => s.id !== subjectId);
            setStorageSubjects(updatedSubjects);
            return updatedSubjects;
        });
    };

    const addNewAnnualScheduleItem = async (newScheduleItem: AnnualScheduleRequest) => {
        const response = await addAnnualScheduleAction(newScheduleItem);
        if (response.success && response.data) {
            setAnnualScheduleTable((prev) => {
                if (!response.data) return prev;
                const updatedSchedule = prev ? [...prev, response.data] : [response.data];
                return updatedSchedule;
            });
        }
        //error msg alert
        return response.message;
    };

    const updateExistingAnnualScheduleItem = async (
        id: string,
        updatedScheduleItem: AnnualScheduleRequest,
    ) => {
        const response = await updateAnnualScheduleAction(id, updatedScheduleItem);
        if (response.success && response.data) {
            setAnnualScheduleTable((prev) => {
                if (!response.data) return prev;
                const updatedSchedule = prev?.map((item) =>
                    item.id === response.data?.id ? response.data : item,
                );
                return updatedSchedule;
            });
        }
        //error msg alert
        return response.message;
    };

    const value: MainContextType = {
        school,
        teachers,
        subjects,
        classes,
        annualScheduleTable,
        addNewClass,
        deleteClass,
        addNewTeacher,
        deleteTeacher,
        addNewSubject,
        deleteSubject,
        addNewAnnualScheduleItem,
        updateExistingAnnualScheduleItem,
    };

    return <MainContext.Provider value={value}>{children}</MainContext.Provider>;
};
