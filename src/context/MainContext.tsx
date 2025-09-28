"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import { AnnualScheduleType } from "@/models/types/annualSchedule";
import { ClassRequest, ClassType } from "@/models/types/classes";
import { SchoolType } from "@/models/types/school";
import { SubjectRequest, SubjectType } from "@/models/types/subjects";
import { TeacherRequest, TeacherType } from "@/models/types/teachers";
import { addClassAction } from "@/app/actions/POST/addClassAction";
import { addSubjectAction } from "@/app/actions/POST/addSubjectAction";
import { addTeacherAction } from "@/app/actions/POST/addTeacherAction";
import { updateClassAction } from "@/app/actions/PUT/updateClassAction";
import { updateSubjectAction } from "@/app/actions/PUT/updateSubjectAction";
import { updateTeacherAction } from "@/app/actions/PUT/updateTeacherAction";
import { deleteClassAction } from "@/app/actions/DELETE/deleteClassAction";
import { deleteSubjectAction } from "@/app/actions/DELETE/deleteSubjectAction";
import { deleteTeacherAction } from "@/app/actions/DELETE/deleteTeacherAction";
import useInitData from "@/hooks/useInitData";
import { setStorageClasses, setStorageSubjects, setStorageTeachers } from "@/lib/localStorage";
import { infoToast } from "@/lib/toast";

interface MainContextType {
    school: SchoolType | undefined;
    teachers: TeacherType[] | undefined;
    subjects: SubjectType[] | undefined;
    classes: ClassType[] | undefined;
    annualAfterDelete: AnnualScheduleType[] | undefined;
    addNewClass: (newClass: ClassRequest) => Promise<ClassType | undefined>;
    updateClass: (classId: string, classData: ClassRequest) => Promise<ClassType[] | undefined>;
    deleteClass: (schoolId: string, classId: string) => Promise<boolean>;
    addNewTeacher: (newTeacher: TeacherRequest) => Promise<TeacherType | undefined>;
    updateTeacher: (
        teacherId: string,
        teacherData: TeacherRequest,
    ) => Promise<TeacherType[] | undefined>;
    deleteTeacher: (schoolId: string, teacherId: string) => Promise<boolean>;
    addNewSubject: (newSubject: SubjectRequest) => Promise<SubjectType | undefined>;
    updateSubject: (
        subjectId: string,
        subjectData: SubjectRequest,
    ) => Promise<SubjectType[] | undefined>;
    deleteSubject: (schoolId: string, subjectId: string) => Promise<boolean>;
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
    const [annualAfterDelete, setAnnualAfterDelete] = useState<AnnualScheduleType[] | undefined>(
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
        if (!response.success && (response as any).errorCode === "23505") {
            infoToast(response.message);
            return undefined;
        }
        return undefined;
    };

    const updateClass = async (classId: string, classData: ClassRequest) => {
        const response = await updateClassAction(classId, classData);
        if (response.success && response.data) {
            setClasses(response.data as ClassType[]);
            setStorageClasses(response.data as ClassType[]);
            return response.data;
        }
        return undefined;
    };

    const deleteClass = async (schoolId: string, classId: string) => {
        const response = await deleteClassAction(schoolId, classId);
        if (response.success && response.classes && response.annualSchedules) {
            setClasses(response.classes);
            setStorageClasses(response.classes);
            setAnnualAfterDelete(response.annualSchedules);
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
        if (!response.success && (response as any).errorCode === "23505") {
            infoToast(response.message);
            return undefined;
        }
    };

    const updateTeacher = async (teacherId: string, teacherData: TeacherRequest) => {
        const response = await updateTeacherAction(teacherId, teacherData);
        if (response.success && response.data) {
            setTeachers(response.data as TeacherType[]);
            setStorageTeachers(response.data as TeacherType[]);
            return response.data;
        }
        return undefined;
    };

    const deleteTeacher = async (schoolId: string, teacherId: string) => {
        const response = await deleteTeacherAction(schoolId, teacherId);
        if (response.success && response.teachers && response.annualSchedules) {
            setTeachers(response.teachers);
            setStorageTeachers(response.teachers);
            setAnnualAfterDelete(response.annualSchedules);
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
        if (!response.success && (response as any).errorCode === "23505") {
            infoToast(response.message);
            return undefined;
        }
        return undefined;
    };

    const updateSubject = async (subjectId: string, subjectData: SubjectRequest) => {
        const response = await updateSubjectAction(subjectId, subjectData);
        if (response.success && response.data) {
            setSubjects(response.data as SubjectType[]);
            setStorageSubjects(response.data as SubjectType[]);
            return response.data;
        }
        return undefined;
    };

    const deleteSubject = async (schoolId: string, subjectId: string) => {
        const response = await deleteSubjectAction(schoolId, subjectId);
        if (response.success && response.subjects && response.annualSchedules) {
            setSubjects(response.subjects);
            setStorageSubjects(response.subjects);
            setAnnualAfterDelete(response.annualSchedules);
            return true;
        }
        return false;
    };

    const value: MainContextType = {
        school,
        teachers,
        subjects,
        classes,
        annualAfterDelete,
        addNewClass,
        updateClass,
        deleteClass,
        addNewTeacher,
        updateTeacher,
        deleteTeacher,
        addNewSubject,
        updateSubject,
        deleteSubject,
    };

    return <MainContext.Provider value={value}>{children}</MainContext.Provider>;
};
