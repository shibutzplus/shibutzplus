"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect, useRef } from "react";
import { useMainContext } from "./MainContext";
import { Pair } from "@/models/types";
import { AnnualInputCellType, AnnualScheduleRequest, AnnualScheduleType, WeeklySchedule } from "@/models/types/annualSchedule";
import { errorToast, successToast } from "@/lib/toast";
import messages from "@/resources/messages";
import { addAnnualAltAction } from "@/app/actions/POST/addAnnualAltAction";
import { deleteAnnualAltByDayClassAction } from "@/app/actions/DELETE/deleteAnnualAltByDayClassAction";
import { getAnnualAltAction } from "@/app/actions/GET/getAnnualAltAction";
import { SelectMethod } from "@/models/types/actions";
import { dayToNumber, DAYS_OF_WORK_WEEK, chooseDefaultDate, getDayNameByDateString } from "@/utils/time";
import { TeacherType } from "@/models/types/teachers";
import { SubjectType } from "@/models/types/subjects";
import { createAnnualByClassRequests, createTeacherSubjectPairs, setNewScheduleTemplate, } from "@/services/annual/initialize";
import { getSelectedClass } from "@/services/annual/get";
import { logErrorAction } from "@/app/actions/POST/logErrorAction";
import { useSession } from "next-auth/react";
import { STATUS_AUTH } from "@/models/constant/session";

interface AnnualAltByDayContextType {
    altScheduleTable: AnnualScheduleType[] | undefined;
    setAltScheduleTable: React.Dispatch<React.SetStateAction<AnnualScheduleType[] | undefined>>;
    selectedDay: string;
    setSelectedDay: React.Dispatch<React.SetStateAction<string>>;
    schedule: WeeklySchedule;
    setSchedule: React.Dispatch<React.SetStateAction<WeeklySchedule>>;
    isLoading: boolean;
    setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
    isSaving: boolean;
    setIsSaving: React.Dispatch<React.SetStateAction<boolean>>;
    handleDayChange: (value: string) => void;
    daysSelectOptions: () => { value: string; label: string }[];
    handleScheduleUpdate: (
        type: AnnualInputCellType,
        elementIds: string[],
        day: string,
        hour: number,
        method: SelectMethod,
        classId: string,
        newElementObj?: TeacherType | SubjectType,
    ) => Promise<void>;
    autoFillMissingSubjects: () => Promise<void>;
}

const AnnualAltByDayContext = createContext<AnnualAltByDayContextType | undefined>(undefined);

export const useAnnualAltByDay = () => {
    const context = useContext(AnnualAltByDayContext);
    if (!context) {
        throw new Error("useAnnualAltByDay must be used within an AnnualAltByDayProvider");
    }
    return context;
};

export const AnnualAltByDayProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { classes, school, teachers, subjects, addNewSubject } = useMainContext();
    const { data: session, status } = useSession();

    const [selectedDay, setSelectedDay] = useState<string>(() => {
        const defaultDateStr = chooseDefaultDate();
        const hebrewDay = getDayNameByDateString(defaultDateStr);
        return DAYS_OF_WORK_WEEK.includes(hebrewDay) ? hebrewDay : DAYS_OF_WORK_WEEK[0];
    });
    const [isSaving, setIsSaving] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [altScheduleTable, setAltScheduleTable] = useState<AnnualScheduleType[] | undefined>(undefined);
    const [queueRows, setQueueRows] = useState<AnnualScheduleRequest[]>([]);
    const [schedule, setSchedule] = useState<WeeklySchedule>({});

    // Safely track state for async callbacks
    const scheduleRef = useRef<WeeklySchedule>({});
    const queueRowsRef = useRef<AnnualScheduleRequest[]>([]);

    // Update refs whenever state changes
    useEffect(() => {
        scheduleRef.current = schedule;
    }, [schedule]);

    useEffect(() => {
        queueRowsRef.current = queueRows;
    }, [queueRows]);

    const fetchedRef = useRef<boolean>(false);

    // Load data once
    useEffect(() => {
        const fetchData = async (schoolId: string) => {
            if (fetchedRef.current) return;
            fetchedRef.current = true;
            try {
                const res = await getAnnualAltAction(schoolId);
                if (res.success && res.data) {
                    setAltScheduleTable(res.data);
                }
            } catch (error) {
                logErrorAction({ description: `Error fetching alt schedule: ${error instanceof Error ? error.message : String(error)}` });
            }
        };

        const effectiveId = school?.id || (status === STATUS_AUTH && session?.user?.schoolId ? session.user.schoolId : undefined);
        if (effectiveId && !altScheduleTable) {
            fetchData(effectiveId);
        }
    }, [session, status, school?.id, altScheduleTable]);

    useEffect(() => {
        if (queueRows.length > 0) {
            handleSave();
        }
    }, [queueRows]);

    const daysSelectOptions = () => {
        return DAYS_OF_WORK_WEEK.map((day) => ({ value: day, label: `יום ${day}'` }));
    };

    const addNewAltScheduleItem = async (newScheduleItem: AnnualScheduleRequest) => {
        const response = await addAnnualAltAction(newScheduleItem);
        if (response.success && response.data) {
            setAltScheduleTable((prev) => {
                if (!response.data) return prev;
                return prev ? [...prev, response.data] : [response.data];
            });
            return response.data;
        }
        return undefined;
    };

    const deleteAltScheduleItem = async (
        day: number,
        hour: number,
        classId: string,
        schoolId: string,
    ) => {
        if (!school?.id) return;
        const response = await deleteAnnualAltByDayClassAction(day, hour, classId, schoolId);
        if (response.success && response.deleted) {
            const deletedIds = response.deleted.map((item: AnnualScheduleType) => item.id);
            setAltScheduleTable((prev) => prev?.filter((item: AnnualScheduleType) => !deletedIds.includes(item.id)));
            return response.deleted;
        }
        return undefined;
    };

    const handleDayChange = (value: string) => {
        if (value) {
            setSelectedDay(value);
        }
    };

    const addToQueue = (rows: AnnualScheduleRequest[]) => {
        setQueueRows((prev) => (Array.isArray(prev) ? [...prev, ...rows] : [...rows]));
    };
    const autoFillMissingSubjects = async (): Promise<void> => {
        if (!school?.id) return;

        let defaultSubject = subjects?.find(s => s.name === "שיעור סנכרוני");
        let hasIncomplete = false;

        const currentSchedule = scheduleRef.current;
        const currentQueueRows = queueRowsRef.current;

        // Check if there's any incomplete cell
        for (const classId in currentSchedule) {
            const days = currentSchedule[classId];
            if (!days) continue;
            for (const d in days) {
                const hours = days[d];
                if (!hours) continue;
                for (const h in hours) {
                    const cell = hours[h];
                    if (cell && (cell.teachers?.length || 0) > 0 && (cell.subjects?.length || 0) === 0) {
                        hasIncomplete = true;
                        break;
                    }
                }
                if (hasIncomplete) break;
            }
            if (hasIncomplete) break;
        }

        if (!hasIncomplete) {
            if (currentQueueRows.length > 0) {
                const pending = [...currentQueueRows];
                setQueueRows([]);
                await handleSave(pending);
            }
            return;
        }

        // Create the default subject if it doesn't exist yet
        if (!defaultSubject) {
            defaultSubject = await addNewSubject({
                schoolId: school.id,
                name: "א-סינכרוני",
            });
        }

        if (!defaultSubject) {
            errorToast("שגיאה ביצירת מקצוע ברירת מחדל");
            return;
        }

        // Apply to schedule and queue
        const newSchedule = { ...currentSchedule };
        const requestsToAdd: AnnualScheduleRequest[] = [];
        let existingQueue = [...currentQueueRows];
        const allSubjects = [...(subjects || []), defaultSubject];
        const availableTeachers = teachers || [];

        for (const classId in newSchedule) {
            const days = newSchedule[classId];
            if (!days) continue;
            for (const d in days) {
                const hours = days[d];
                if (!hours) continue;
                for (const h in hours) {
                    const cell = hours[h];
                    if (cell && (cell.teachers?.length || 0) > 0 && (cell.subjects?.length || 0) === 0) {
                        newSchedule[classId][d][h].subjects = [defaultSubject.id];

                        const selectedClassObj = getSelectedClass(classes, classId);
                        const pairs = createTeacherSubjectPairs(cell.teachers, [defaultSubject.id]);
                        const updatedRequests = createAnnualByClassRequests(
                            selectedClassObj,
                            school,
                            availableTeachers,
                            allSubjects,
                            pairs,
                            d,
                            parseInt(h),
                        );

                        // Overwrite previous incomplete requests in queue if any exist
                        existingQueue = existingQueue.filter(req =>
                            !(req.class?.id === classId && req.day === dayToNumber(d) && req.hour === parseInt(h))
                        );

                        requestsToAdd.push(...updatedRequests);
                    }
                }
            }
        }

        setSchedule(newSchedule);
        const finalQueue = [...existingQueue, ...requestsToAdd];
        if (finalQueue.length > 0) {
            setQueueRows([]);
            await handleSave(finalQueue);
        }
    };

    const handleSave = async (forceRows?: AnnualScheduleRequest[]) => {
        setIsSaving(true);
        const rowsToSave = forceRows || queueRowsRef.current;
        if (rowsToSave.length === 0 || !school?.id) {
            setIsSaving(false);
            return;
        }

        try {
            const uniqueCellsMap = new Map<string, { day: number; hour: number; classId: string }>();
            for (const row of rowsToSave) {
                const key = `${row.class?.id}_${row.day}_${row.hour}`;
                if (!uniqueCellsMap.has(key) && row.class?.id) {
                    uniqueCellsMap.set(key, { day: row.day, hour: row.hour, classId: row.class.id });
                }
            }
            for (const { day, hour, classId } of uniqueCellsMap.values()) {
                await deleteAltScheduleItem(day, hour, classId, school.id);
            }
            for (const row of rowsToSave) {
                await addNewAltScheduleItem(row);
            }
        } catch (error) {
            logErrorAction({
                description: `Error saving alt schedule: ${error instanceof Error ? error.message : String(error)}`,
                schoolId: school?.id,
            });
            errorToast(messages.annualSchedule.error);
        } finally {
            if (!forceRows) {
                setQueueRows([]);
            }
            setIsSaving(false);
        }
    };

    const handleScheduleUpdate = async (
        type: AnnualInputCellType,
        elementIds: string[],
        day: string,
        hour: number,
        method: SelectMethod,
        classId: string,
        newElementObj?: TeacherType | SubjectType,
    ) => {
        if (!school?.id) return;

        // Check for teacher conflicts: warn if a teacher is already assigned to another class at the same day+hour
        if (type === "teachers" && elementIds.length > 0) {
            for (const teacherId of elementIds) {
                for (const [otherClassId, dayMap] of Object.entries(schedule)) {
                    if (otherClassId === classId) continue;
                    const existingTeachers = dayMap?.[day]?.[hour]?.teachers ?? [];
                    if (existingTeachers.includes(teacherId)) {
                        const teacher = teachers?.find((t) => t.id === teacherId);
                        const conflictClass = classes?.find((c) => c.id === otherClassId);
                        const teacherName = teacher?.name ?? "המורה";
                        const className = conflictClass?.name ?? "כיתה אחרת";
                        if (conflictClass?.activity) {
                            successToast(`שימו ❤️: ${teacherName} משובץ/ת גם ל${className}`, 3000);
                        } else {
                            errorToast(`שימו ❤️: ${teacherName} כבר משובץ/ת ב${className}`, 10000);
                        }
                    }
                }
            }
        }

        const currentCell = schedule[classId]?.[day]?.[hour];
        const wasComplete = (currentCell?.teachers?.length || 0) > 0 && (currentCell?.subjects?.length || 0) > 0;

        let newSchedule = { ...schedule };
        newSchedule = setNewScheduleTemplate(newSchedule, classId, day, hour);

        // Update the cell reference
        const cell = newSchedule[classId][day][hour];
        cell[type] = elementIds;

        const teacherIds = cell.teachers;
        const subjectIds = cell.subjects;

        setSchedule(newSchedule);

        if (subjectIds.length === 0 || teacherIds.length === 0) {
            if (method === "remove-value" && wasComplete) {
                const dayNum = dayToNumber(day);
                await deleteAltScheduleItem(dayNum, hour, classId, school.id);
            }
            return;
        }

        let teachersList = [...(teachers || [])];
        let subjectsList = [...(subjects || [])];
        if (method === "create-option" && newElementObj) {
            teachersList = type === "teachers" ? [newElementObj as TeacherType] : teachers || [];
            subjectsList = type === "subjects" ? [newElementObj as SubjectType] : subjects || [];
        }

        const pairs: Pair[] = createTeacherSubjectPairs(teacherIds, subjectIds);
        const selectedClassObj = getSelectedClass(classes, classId);
        const requests: AnnualScheduleRequest[] = createAnnualByClassRequests(
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

    return (
        <AnnualAltByDayContext.Provider
            value={{
                altScheduleTable,
                setAltScheduleTable,
                selectedDay,
                setSelectedDay,
                schedule,
                setSchedule,
                isLoading,
                setIsLoading,
                isSaving,
                setIsSaving,
                handleDayChange,
                daysSelectOptions,
                handleScheduleUpdate,
                autoFillMissingSubjects,
            }}
        >
            {children}
        </AnnualAltByDayContext.Provider>
    );
};
