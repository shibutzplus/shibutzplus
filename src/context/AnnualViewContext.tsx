"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { STATUS_AUTH } from "@/models/constant/session";
import { useMainContext } from "./MainContext";
import { createSelectOptions } from "@/utils/format";
import { compareHebrew, sortByName } from "@/utils/sort";
import { ClassType } from "@/models/types/classes";
import { TeacherType, TeacherRoleValues } from "@/models/types/teachers";
import { AnnualScheduleType, WeeklySchedule } from "@/models/types/annualSchedule";
import { populateAllClassesSchedule, populateAllTeachersSchedule } from "@/services/annual/populate";
import { initializeEmptyAnnualSchedule } from "@/services/annual/initialize";
import { getAnnualAltAction } from "@/app/actions/GET/getAnnualAltAction";
import { logErrorAction } from "@/app/actions/POST/logErrorAction";

export type AnnualViewMode = "regular" | "emergency";

interface AnnualViewContextType {
    mode: AnnualViewMode;
    isAlt: boolean;
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
    applyBatchScheduleUpdates: (deletedIds: string[], addedItems: AnnualScheduleType[]) => void;
}

const AnnualViewContext = createContext<AnnualViewContextType | undefined>(undefined);

export const useAnnualView = () => {
    const context = useContext(AnnualViewContext);
    if (!context) {
        throw new Error("useAnnualView must be used within an AnnualViewProvider");
    }
    return context;
};

export const useOptionalAnnualView = () => useContext(AnnualViewContext);

export interface AnnualViewProviderProps {
    children: ReactNode;
    mode?: AnnualViewMode;
}

export const AnnualViewProvider: React.FC<AnnualViewProviderProps> = ({
    children,
    mode = "regular",
}) => {
    const isAlt = mode === "emergency";
    const { classes, school, teachers, annualScheduleTable, applyBatchAnnualScheduleUpdates } = useMainContext();
    const { data: session, status } = useSession();

    const [selectedClassId, setSelectedClassId] = useState<string>("");
    const [selectedTeacherId, setSelectedTeacherId] = useState<string>("");
    const [isLoading, setIsLoading] = useState<boolean>(isAlt);
    const [altScheduleTable, setAltScheduleTable] = useState<AnnualScheduleType[] | undefined>(undefined);
    const [schedule, setSchedule] = useState<WeeklySchedule>({});
    const fetchedRef = useRef<boolean>(false);

    const searchParams = useSearchParams();

    // Fetch alt schedule data if in emergency mode
    useEffect(() => {
        if (!isAlt) return;

        const fetchData = async (schoolId: string) => {
            if (fetchedRef.current) return;
            fetchedRef.current = true;
            try {
                const res = await getAnnualAltAction(schoolId);
                if (res.success && res.data) {
                    setAltScheduleTable(res.data);
                }
            } catch (error) {
                logErrorAction({
                    description: `Error fetching alt view schedule: ${error instanceof Error ? error.message : String(error)}`,
                });
            } finally {
                setIsLoading(false);
            }
        };

        const effectiveId =
            school?.id || (status === STATUS_AUTH && session?.user?.schoolId ? session.user.schoolId : undefined);
        if (effectiveId && !altScheduleTable) {
            fetchData(effectiveId);
        }
    }, [isAlt, session, status, school?.id, altScheduleTable]);

    // Active schedule data table (regular from MainContext vs alt fetched here)
    const activeScheduleTable = isAlt ? altScheduleTable : annualScheduleTable;

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
        if (!activeScheduleTable || (!selectedClassId && !selectedTeacherId)) {
            setSchedule({});
            if (!isAlt) setIsLoading(false);
            return;
        }

        setIsLoading(true);
        let newSchedule: WeeklySchedule = {};

        if (selectedClassId && !selectedTeacherId) {
            // Only Class selected
            newSchedule = initializeEmptyAnnualSchedule({}, selectedClassId, school?.fromHour ?? 1, school?.toHour ?? 10);
            newSchedule = populateAllClassesSchedule(activeScheduleTable, newSchedule);
        } else if (!selectedClassId && selectedTeacherId) {
            // Only Teacher selected
            newSchedule = initializeEmptyAnnualSchedule({}, selectedTeacherId, school?.fromHour ?? 1, school?.toHour ?? 10);
            newSchedule = populateAllTeachersSchedule(activeScheduleTable, newSchedule);
        } else if (selectedClassId && selectedTeacherId) {
            // Both selected: Class structure as base, cell handles filtering/highlighting
            newSchedule = initializeEmptyAnnualSchedule({}, selectedClassId, school?.fromHour ?? 1, school?.toHour ?? 10);
            newSchedule = populateAllClassesSchedule(activeScheduleTable, newSchedule);
        }

        setSchedule(newSchedule);
        setIsLoading(false);
    }, [selectedClassId, selectedTeacherId, activeScheduleTable, school, isAlt]);

    const applyBatchScheduleUpdates = (deletedIds: string[], addedItems: AnnualScheduleType[]) => {
        if (isAlt) {
            setAltScheduleTable((prev) => {
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
        } else {
            applyBatchAnnualScheduleUpdates(deletedIds, addedItems);
        }
    };

    const classesSelectOptions = () => {
        if (isAlt) {
            const sortedClasses = [...(classes || [])]
                .filter((c) => !c.activity)
                .sort((a, b) => compareHebrew(a.name, b.name));
            return createSelectOptions<ClassType>(sortedClasses);
        }

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
                mode,
                isAlt,
                annualScheduleTable: activeScheduleTable,
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
                applyBatchScheduleUpdates,
            }}
        >
            {children}
        </AnnualViewContext.Provider>
    );
};
