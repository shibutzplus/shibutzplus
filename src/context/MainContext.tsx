"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import { AnnualScheduleType } from "@/models/types/annualSchedule";
import { ClassRequest, ClassType } from "@/models/types/classes";
import { SchoolType } from "@/models/types/school";
import { SubjectRequest, SubjectType } from "@/models/types/subjects";
import { TeacherRequest, TeacherType } from "@/models/types/teachers";
import { SchoolSettingsType } from "@/models/types/settings";
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
import { errorToast } from "@/lib/toast";
import { pushSyncUpdate } from "@/services/syncService";
import { UPDATE_DETAIL } from "@/models/constant/sync";
import { removeSessionStorage, SESSION_KEYS } from "@/lib/sessionStorage";

interface MainContextType {
    school: SchoolType | undefined;
    settings: SchoolSettingsType | undefined;
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
    setSchool: React.Dispatch<React.SetStateAction<SchoolType | undefined>>;
}

const MainContext = createContext<MainContextType | undefined>(undefined);

export const useMainContext = () => {
    const context = useContext(MainContext);
    if (context === undefined) {
        throw new Error("useMainContext must be used within a MainContextProvider");
    }
    return context;
};

export const useOptionalMainContext = () => {
    return useContext(MainContext);
};

interface MainContextProviderProps {
    children: ReactNode;
}

export const MainContextProvider: React.FC<MainContextProviderProps> = ({ children }) => {
    const [school, setSchool] = useState<SchoolType | undefined>(undefined);
    const settings: SchoolSettingsType | undefined = school ? {
        id: 0,
        schoolId: school.id,
        hoursNum: school.hoursNum ?? 10,
        displaySchedule2Susb: school.displaySchedule2Susb ?? false,
    } : undefined;

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

    const addNewSubject = async (newSubject: SubjectRequest) => {
        const response = await addSubjectAction(newSubject);
        if (response.success && response.data) {
            setSubjects((prev) => {
                if (!response.data) return prev;
                const updatedSubjects = prev ? [...prev, response.data] : [response.data];
                setStorageSubjects(updatedSubjects);
                return updatedSubjects;
            });
            removeSessionStorage(SESSION_KEYS.DAILY_TABLE_DATA);
            void pushSyncUpdate(UPDATE_DETAIL);
            return response.data;
        }
        if (!response.success && (response as any).errorCode === "23505") {
            errorToast(response.message || "שגיאה ביצירת פריט");
            return undefined;
        }
        return undefined;
    };

    const updateSubject = async (subjectId: string, subjectData: SubjectRequest) => {
        const response = await updateSubjectAction(subjectId, subjectData);
        if (response.success && response.data) {
            setSubjects(response.data as SubjectType[]);
            setStorageSubjects(response.data as SubjectType[]);
            removeSessionStorage(SESSION_KEYS.DAILY_TABLE_DATA);
            void pushSyncUpdate(UPDATE_DETAIL);
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
            removeSessionStorage(SESSION_KEYS.DAILY_TABLE_DATA);
            void pushSyncUpdate(UPDATE_DETAIL);
            return true;
        }
        return false;
    };

    const addNewClass = async (newClass: ClassRequest) => {
        const response = await addClassAction(newClass);
        if (response.success && response.data) {
            setClasses((prev) => {
                if (!response.data) return prev;
                const updatedClasses = prev ? [...prev, response.data] : [response.data];
                setStorageClasses(updatedClasses);
                return updatedClasses;
            });

            if (newClass.activity) {
                await addNewSubject({
                    name: newClass.name,
                    schoolId: newClass.schoolId,
                    activity: true
                });
            }

            removeSessionStorage(SESSION_KEYS.DAILY_TABLE_DATA);
            void pushSyncUpdate(UPDATE_DETAIL);
            return response.data;
        }
        if (!response.success && (response as any).errorCode === "23505") {
            errorToast(response.message || "שגיאה ביצירת פריט");
            return undefined;
        }
        return undefined;
    };

    const updateClass = async (classId: string, classData: ClassRequest) => {
        const originalClass = classes?.find((c) => c.id === classId);

        const response = await updateClassAction(classId, classData);
        if (response.success && response.data) {
            setClasses(response.data as ClassType[]);
            setStorageClasses(response.data as ClassType[]);

            if (originalClass?.activity && originalClass.name !== classData.name) {
                const subjectToUpdate = subjects?.find(
                    (s) => s.name === originalClass.name && s.activity === true
                );

                if (subjectToUpdate) {
                    await updateSubject(subjectToUpdate.id, {
                        ...subjectToUpdate,
                        name: classData.name
                    });
                }
            }

            removeSessionStorage(SESSION_KEYS.DAILY_TABLE_DATA);
            void pushSyncUpdate(UPDATE_DETAIL);
            return response.data;
        }
        return undefined;
    };

    const deleteClass = async (schoolId: string, classId: string) => {
        const classToDelete = classes?.find((c) => c.id === classId);

        const response = await deleteClassAction(schoolId, classId);
        if (response.success && response.classes && response.annualSchedules) {
            setClasses(response.classes);
            setStorageClasses(response.classes);
            setAnnualAfterDelete(response.annualSchedules);

            if (classToDelete?.activity && classToDelete.name) {
                const subjectToDelete = subjects?.find(
                    (s) => s.name === classToDelete.name && s.activity === true
                );

                if (subjectToDelete) {
                    await deleteSubject(schoolId, subjectToDelete.id);
                }
            }

            removeSessionStorage(SESSION_KEYS.DAILY_TABLE_DATA);
            void pushSyncUpdate(UPDATE_DETAIL);
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
            removeSessionStorage(SESSION_KEYS.DAILY_TABLE_DATA);
            void pushSyncUpdate(UPDATE_DETAIL);
            return response.data;
        }
        if (!response.success && (response as any).errorCode === "23505") {
            errorToast(response.message || "שגיאה ביצירת פריט");
            return undefined;
        }
    };

    const updateTeacher = async (teacherId: string, teacherData: TeacherRequest) => {
        const response = await updateTeacherAction(teacherId, teacherData);
        if (response.success && response.data) {
            setTeachers(response.data as TeacherType[]);
            setStorageTeachers(response.data as TeacherType[]);
            removeSessionStorage(SESSION_KEYS.DAILY_TABLE_DATA);
            void pushSyncUpdate(UPDATE_DETAIL);
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
            removeSessionStorage(SESSION_KEYS.DAILY_TABLE_DATA);
            void pushSyncUpdate(UPDATE_DETAIL);
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
        setSchool,
        settings,
    };

    return <MainContext.Provider value={value}>{children}</MainContext.Provider>;
};
