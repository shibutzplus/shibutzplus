"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect, useRef } from "react";
import { AnnualScheduleType, AnnualScheduleRequest } from "@/models/types/annualSchedule";
import { ClassRequest, ClassType } from "@/models/types/classes";
import { SchoolType } from "@/models/types/school";
import { ENTITIES_DATA_CHANGED } from "@/models/constant/sync";
import { SubjectRequest, SubjectType } from "@/models/types/subjects";
import { TeacherRequest, TeacherType } from "@/models/types/teachers";
import { SchoolSettingsType } from "@/models/types/settings";
import { addAnnualScheduleAction } from "@/app/actions/POST/addAnnualScheduleAction";
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
import useInitAnnualData from "@/hooks/useInitAnnualData";
import { errorToast } from "@/lib/toast";
import { SyncItem, SyncChannel } from "@/services/sync/clientSyncService";
import { compareHebrew, sortByName } from "@/utils/sort";
import { usePollingUpdates } from "@/hooks/usePollingUpdates";

const ENTITY_CHANNELS: SyncChannel[] = [ENTITIES_DATA_CHANGED];

interface MainContextType {
    school: SchoolType | undefined;
    settings: SchoolSettingsType | undefined;
    teachers: TeacherType[] | undefined;
    subjects: SubjectType[] | undefined;
    classes: ClassType[] | undefined;
    annualScheduleTable: AnnualScheduleType[] | undefined;
    setAnnualScheduleTable: React.Dispatch<React.SetStateAction<AnnualScheduleType[] | undefined>>;
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
    addNewAnnualScheduleItem: (newScheduleItem: AnnualScheduleRequest) => Promise<AnnualScheduleType | undefined>;
    removeItemsFromAnnualScheduleTable: (deletedIds: string[]) => void;
    applyBatchAnnualScheduleUpdates: (deletedIds: string[], addedItems: AnnualScheduleType[]) => void;
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
    const settings: SchoolSettingsType | undefined = school ? { id: 0, schoolId: school.id, fromHour: school.fromHour ?? 1, toHour: school.toHour ?? 10, displaySchedule2Susb: school.displaySchedule2Susb ?? false, displayAltSchedule: school.displayAltSchedule ?? false, } : undefined;
    const [teachers, setTeachers] = useState<TeacherType[] | undefined>(undefined);
    const [subjects, setSubjects] = useState<SubjectType[] | undefined>(undefined);
    const [classes, setClasses] = useState<ClassType[] | undefined>(undefined);
    const [annualScheduleTable, setAnnualScheduleTable] = useState<AnnualScheduleType[] | undefined>(undefined);
    const [annualAfterDelete, setAnnualAfterDelete] = useState<AnnualScheduleType[] | undefined>(undefined);

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

    useInitAnnualData({
        annualScheduleTable,
        setAnnualScheduleTable,
        schoolId: school?.id,
    });

    // Clear annual schedule table when school changes to prevent stale data
    useEffect(() => {
        if (school?.id) {
            setAnnualScheduleTable(undefined);
        }
    }, [school?.id]);

    // Setup polling for entity changes
    const refreshEntitiesRef = useRef<((items: SyncItem[]) => Promise<void> | void) | null>(null);
    usePollingUpdates(refreshEntitiesRef, ENTITY_CHANNELS);

    useEffect(() => {
        refreshEntitiesRef.current = async (items) => {
            const relevantUpdates = items.filter(item => {
                if (item.channel !== ENTITIES_DATA_CHANGED) return false;
                // Filter by school if payload exists
                if (item.payload?.schoolId && item.payload.schoolId !== school?.id) return false;
                return true;
            });

            if (relevantUpdates.length > 0 && school?.id) {
                const { getInitialDataAction } = await import("@/app/actions/GET/getInitialDataAction");
                const { teachers: fetchedTeachers, subjects: fetchedSubjects, classes: fetchedClasses } = await getInitialDataAction(school.id);

                if (fetchedTeachers.success && fetchedTeachers.data) {
                    const sorted = [...fetchedTeachers.data].sort(sortByName);
                    setTeachers(sorted);
                }

                if (fetchedSubjects.success && fetchedSubjects.data) {
                    const sorted = [...fetchedSubjects.data].sort(sortByName);
                    setSubjects(sorted);
                }

                if (fetchedClasses.success && fetchedClasses.data) {
                    const sorted = [...fetchedClasses.data].sort((a, b) => {
                        if (a.activity !== b.activity) return a.activity ? 1 : -1;
                        return compareHebrew(a.name, b.name);
                    });
                    setClasses(sorted);
                }

                // Force refresh of annual schedule table
                setAnnualScheduleTable(undefined);
            }
        };
    }, [school?.id]);

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

    const removeItemsFromAnnualScheduleTable = (deletedIds: string[]) => {
        setAnnualScheduleTable((prev) => {
            const deletedSet = new Set(deletedIds);
            const updatedSchedule = prev?.filter((item) => !deletedSet.has(item.id));
            return updatedSchedule;
        });
    };

    const applyBatchAnnualScheduleUpdates = (deletedIds: string[], addedItems: AnnualScheduleType[]) => {
        setAnnualScheduleTable((prev) => {
            let next = prev ? [...prev] : [];
            if (deletedIds.length > 0) {
                const deletedSet = new Set(deletedIds);
                next = next.filter((item) => !deletedSet.has(item.id));
            }
            if (addedItems.length > 0) {
                next = [...next, ...addedItems];
            }
            return next;
        });
    };

    const addNewSubject = async (newSubject: SubjectRequest) => {
        const response = await addSubjectAction(newSubject);
        if (response.success && response.data) {
            setSubjects((prev) => {
                if (!response.data) return prev;
                const updatedSubjects = prev ? [...prev, response.data] : [response.data];
                updatedSubjects.sort(sortByName);
                return updatedSubjects;
            });
            return response.data;
        }
        if (!response.success && (response as any).errorCode === "23505") {
            errorToast(response.message || "שגיאה ביצירת מקצוע");
            return undefined;
        }
        return undefined;
    };

    const updateSubject = async (subjectId: string, subjectData: SubjectRequest) => {
        const response = await updateSubjectAction(subjectId, subjectData);
        if (response.success && response.data) {
            setSubjects(response.data as SubjectType[]);
            return response.data;
        }
        return undefined;
    };

    const deleteSubject = async (schoolId: string, subjectId: string) => {
        const response = await deleteSubjectAction(schoolId, subjectId);
        if (response.success && response.subjects && response.annualSchedules) {
            setSubjects(response.subjects);
            setAnnualScheduleTable(response.annualSchedules);
            setAnnualAfterDelete(response.annualSchedules);
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
                updatedClasses.sort((a, b) => {
                    if (a.activity !== b.activity) return a.activity ? 1 : -1;
                    return compareHebrew(a.name, b.name);
                });

                return updatedClasses;
            });

            if (newClass.activity) {
                await addNewSubject({
                    name: newClass.name,
                    schoolId: newClass.schoolId,
                    activity: true
                });
            }

            return response.data;
        }
        if (!response.success && (response as any).errorCode === "23505") {
            errorToast(response.message || "שגיאה ביצירת כיתה");
            return undefined;
        }
        return undefined;
    };

    const updateClass = async (classId: string, classData: ClassRequest) => {
        const originalClass = classes?.find((c) => c.id === classId);

        const response = await updateClassAction(classId, classData);
        if (response.success && response.data) {
            setClasses(response.data as ClassType[]);


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

            return response.data;
        }
        return undefined;
    };

    const deleteClass = async (schoolId: string, classId: string) => {
        const classToDelete = classes?.find((c) => c.id === classId);

        const response = await deleteClassAction(schoolId, classId);
        if (response.success && response.classes && response.annualSchedules) {
            setClasses(response.classes);

            setAnnualScheduleTable(response.annualSchedules);
            setAnnualAfterDelete(response.annualSchedules);

            if (classToDelete?.activity && classToDelete.name) {
                const subjectToDelete = subjects?.find(
                    (s) => s.name === classToDelete.name && s.activity === true
                );

                if (subjectToDelete) {
                    await deleteSubject(schoolId, subjectToDelete.id);
                }
            }

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
                updatedTeachers.sort(sortByName);

                return updatedTeachers;
            });
            return response.data;
        }
        if (!response.success && (response as any).errorCode === "23505") {
            errorToast(response.message || "שגיאה ביצירת מורה");
            return undefined;
        }
    };

    const updateTeacher = async (teacherId: string, teacherData: TeacherRequest) => {
        const response = await updateTeacherAction(teacherId, teacherData);
        if (response.success && response.data) {
            setTeachers(response.data as TeacherType[]);

            return response.data;
        }
        return undefined;
    };

    const deleteTeacher = async (schoolId: string, teacherId: string) => {
        const response = await deleteTeacherAction(schoolId, teacherId);
        if (response.success && response.teachers && response.annualSchedules) {
            setTeachers(response.teachers);

            setAnnualScheduleTable(response.annualSchedules);
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
        annualScheduleTable,
        setAnnualScheduleTable,
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
        addNewAnnualScheduleItem,
        removeItemsFromAnnualScheduleTable,
        applyBatchAnnualScheduleUpdates,
        setSchool,
        settings,
    };

    return <MainContext.Provider value={value}>{children}</MainContext.Provider>;
};
