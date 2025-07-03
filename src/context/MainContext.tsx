"use client";

import { SchoolType } from "@/models/types/school";
import { TeacherRequest, TeacherType } from "@/models/types/teachers";
import { SubjectRequest, SubjectType } from "@/models/types/subjects";
import { ClassRequest, ClassType } from "@/models/types/classes";
import React, { createContext, useContext, useState, ReactNode } from "react";
import { AnnualScheduleRequest, AnnualScheduleType } from "@/models/types/annualSchedule";
import { DailyScheduleType } from "@/models/types/dailySchedule";
import { addClassAction } from "@/app/actions/addClassAction";
import { addTeacherAction } from "@/app/actions/addTeacherAction";
import { updateTeacherAction } from "@/app/actions/updateTeacherAction";
import { addSubjectAction } from "@/app/actions/addSubjectAction";
import { updateSubjectAction } from "@/app/actions/updateSubjectAction";
import { updateClassAction } from "@/app/actions/updateClassAction";
import { updateAnnualScheduleAction } from "@/app/actions/updateAnnualScheduleAction";
import { addAnnualScheduleAction } from "@/app/actions/addAnnualScheduleAction";
import useInitData from "@/hooks/useInitData";
import { setStorageClasses, setStorageSubjects, setStorageTeachers } from "@/utils/localStorage";
import { deleteClassAction } from "@/app/actions/deleteClassAction";
import { deleteTeacherAction } from "@/app/actions/deleteTeacherAction";
import { deleteSubjectAction } from "@/app/actions/deleteSubjectAction";

interface MainContextType {
    school: SchoolType | undefined;
    teachers: TeacherType[] | undefined;
    subjects: SubjectType[] | undefined;
    classes: ClassType[] | undefined;
    annualScheduleTable: AnnualScheduleType[] | undefined;
    dailyScheduleData: DailyScheduleType[] | undefined;
    addNewClass: (newClass: ClassRequest) => Promise<ClassType | undefined>;
    updateClass: (classId: string, classData: ClassRequest) => Promise<ClassType | undefined>;
    deleteClass: (schoolId: string, classId: string) => Promise<boolean>;
    addNewTeacher: (newTeacher: TeacherRequest) => Promise<TeacherType | undefined>;
    updateTeacher: (teacherId: string, teacherData: TeacherRequest) => Promise<TeacherType | undefined>;
    deleteTeacher: (schoolId: string, teacherId: string) => Promise<boolean>;
    addNewSubject: (newSubject: SubjectRequest) => Promise<SubjectType | undefined>;
    updateSubject: (subjectId: string, subjectData: SubjectRequest) => Promise<SubjectType | undefined>;
    deleteSubject: (schoolId: string, subjectId: string) => Promise<boolean>;
    addNewAnnualScheduleItem: (newScheduleItem: AnnualScheduleRequest) => Promise<AnnualScheduleType | undefined>;
    updateExistingAnnualScheduleItem: (
        id: string,
        updatedScheduleItem: AnnualScheduleRequest,
    ) => Promise<string | undefined>;
    // addNewDailyScheduleItem: (newScheduleItem: DailyScheduleRequest) => Promise<DailyScheduleType | undefined>;
    // updateExistingDailyScheduleItem: (
    //     id: string,
    //     updatedScheduleItem: DailyScheduleRequest,
    // ) => Promise<string | undefined>;
    // updateDailySchedule: (dailySchedule: DailyScheduleType[]) => void;
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
    const [dailyScheduleData, setDailyScheduleData] = useState<DailyScheduleType[] | undefined>(
        undefined,
    );

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
        dailyScheduleData,
        setDailyScheduleData,
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
            return response.data;
        }
        return undefined;
    };

    const updateClass = async (classId: string, classData: ClassRequest) => {
        const response = await updateClassAction(classId, classData);
        if (response.success && response.data) {
            setClasses((prev) => {
                if (!prev || !response.data) return prev;
                const updatedClasses = prev.map(cls => 
                    cls.id === classId ? response.data! : cls
                );
                setStorageClasses(updatedClasses);
                return updatedClasses;
            });
            return response.data;
        }
        return undefined;
    };

    const deleteClass = async (schoolId: string, classId: string) => {
        const response = await deleteClassAction(schoolId, classId);
        if (response.success && response.classes && response.annualSchedules) {
            setClasses(response.classes);
            setStorageClasses(response.classes);
            setAnnualScheduleTable(response.annualSchedules);
            return true;
        }
        return false;
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
            return response.data;
        }
        return undefined;
    };

    const updateTeacher = async (teacherId: string, teacherData: TeacherRequest) => {
        const response = await updateTeacherAction(teacherId, teacherData);
        if (response.success && response.data) {
            setTeachers((prev) => {
                if (!prev || !response.data) return prev;
                // Ensure we're mapping to a definite TeacherType (not undefined)
                const updatedTeachers = prev.map(teacher => 
                    teacher.id === teacherId ? response.data! : teacher
                );
                setStorageTeachers(updatedTeachers);
                return updatedTeachers;
            });
            return response.data;
        }
        return undefined;
    };

    const deleteTeacher = async (schoolId: string, teacherId: string) => {
        const response = await deleteTeacherAction(schoolId, teacherId);
        if (response.success && response.teachers && response.annualSchedules) {
            setTeachers(response.teachers);
            setStorageTeachers(response.teachers);
            setAnnualScheduleTable(response.annualSchedules);
            return true;
        }
        return false;
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
            return response.data;
        }
        return undefined;
    };

    const updateSubject = async (subjectId: string, subjectData: SubjectRequest) => {
        const response = await updateSubjectAction(subjectId, subjectData);
        if (response.success && response.data) {
            setSubjects((prev) => {
                if (!prev || !response.data) return prev;
                const updatedSubjects = prev.map(subject => 
                    subject.id === subjectId ? response.data! : subject
                );
                setStorageSubjects(updatedSubjects);
                return updatedSubjects;
            });
            return response.data;
        }
        return undefined;
    };

    const deleteSubject = async (schoolId: string, subjectId: string) => {
        const response = await deleteSubjectAction(schoolId, subjectId);
        if (response.success && response.subjects && response.annualSchedules) {
            setSubjects(response.subjects);
            setStorageSubjects(response.subjects);
            setAnnualScheduleTable(response.annualSchedules);
            return true;
        }
        return false;
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
            return response.data.id;
        }
        return undefined;
    };

    // const addNewDailyScheduleItem = async (newScheduleItem: DailyScheduleRequest) => {
    //     const response = await addDailyCellAction(newScheduleItem);
    //     if (response.success && response.data) {
    //         setDailyScheduleData((prev) => {
    //             if (!response.data) return prev;
    //             const updatedSchedule = prev ? [...prev, response.data] : [response.data];
    //             return updatedSchedule;
    //         });
    //         return response.data;
    //     }
    //     return undefined;
    // };

    // const updateExistingDailyScheduleItem = async (
    //     id: string,
    //     updatedScheduleItem: DailyScheduleRequest,
    // ) => {
    //     const response = await updateDailyScheduleAction(id, updatedScheduleItem);
    //     if (response.success && response.data) {
    //         setDailyScheduleData((prev) => {
    //             if (!prev || !response.data) return prev;
    //             const updatedSchedule = prev?.map((item) =>
    //                 item.id === response.data?.id ? response.data : item,
    //             );
    //             return updatedSchedule;
    //         });
    //         return response.data.id;
    //     }
    //     return undefined;
    // };

    // const updateDailySchedule = (dailySchedule: DailyScheduleType[]) => {
    //     setDailyScheduleData(dailySchedule);
    // };

    const value: MainContextType = {
        school,
        teachers,
        subjects,
        classes,
        annualScheduleTable,
        dailyScheduleData,
        addNewClass,
        updateClass,
        deleteClass,
        addNewTeacher,
        updateTeacher,
        deleteTeacher,
        addNewSubject,
        updateSubject,
        deleteSubject,
        addNewAnnualScheduleItem,
        updateExistingAnnualScheduleItem,
        // addNewDailyScheduleItem,
        // updateExistingDailyScheduleItem,
        // updateDailySchedule,
    };

    return <MainContext.Provider value={value}>{children}</MainContext.Provider>;
};
