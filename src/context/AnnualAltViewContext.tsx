"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect, useRef } from "react";
import { useMainContext } from "./MainContext";
import { createSelectOptions } from "@/utils/format";
import { compareHebrew, sortByName } from "@/utils/sort";
import { ClassType } from "@/models/types/classes";
import { TeacherType, TeacherRoleValues } from "@/models/types/teachers";
import { AnnualScheduleType, WeeklySchedule } from "@/models/types/annualSchedule";
import { populateAllClassesSchedule, populateAllTeachersSchedule } from "@/services/annual/populate";
import { initializeEmptyAnnualSchedule } from "@/services/annual/initialize";
import { getAnnualAltAction } from "@/app/actions/GET/getAnnualAltAction";
import { useSession } from "next-auth/react";
import { STATUS_AUTH } from "@/models/constant/session";
import { logErrorAction } from "@/app/actions/POST/logErrorAction";

interface AnnualAltViewContextType {
    annualAltScheduleTable: AnnualScheduleType[] | undefined;
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

const AnnualAltViewContext = createContext<AnnualAltViewContextType | undefined>(undefined);

export const useAnnualAltView = () => {
    const context = useContext(AnnualAltViewContext);
    if (!context) {
        throw new Error("useAnnualAltView must be used within an AnnualAltViewProvider");
    }
    return context;
};

export const AnnualAltViewProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { classes, school, teachers } = useMainContext();
    const { data: session, status } = useSession();
    const [selectedClassId, setSelectedClassId] = useState<string>("");
    const [selectedTeacherId, setSelectedTeacherId] = useState<string>("");
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [annualAltScheduleTable, setAnnualAltScheduleTable] = useState<AnnualScheduleType[] | undefined>(undefined);
    const [schedule, setSchedule] = useState<WeeklySchedule>({});
    const fetchedRef = useRef<boolean>(false);

    // Fetch alt schedule data once
    useEffect(() => {
        const fetchData = async (schoolId: string) => {
            if (fetchedRef.current) return;
            fetchedRef.current = true;
            try {
                const res = await getAnnualAltAction(schoolId);
                if (res.success && res.data) {
                    setAnnualAltScheduleTable(res.data);
                }
            } catch (error) {
                logErrorAction({ description: `Error fetching alt view schedule: ${error instanceof Error ? error.message : String(error)}` });
            } finally {
                setIsLoading(false);
            }
        };

        const effectiveId = school?.id || (status === STATUS_AUTH && session?.user?.schoolId ? session.user.schoolId : undefined);
        if (effectiveId && !annualAltScheduleTable) {
            fetchData(effectiveId);
        }
    }, [session, status, school?.id, annualAltScheduleTable]);

    // Populate schedule based on selection
    useEffect(() => {
        if (!annualAltScheduleTable || (!selectedClassId && !selectedTeacherId)) {
            setSchedule({});
            return;
        }

        setIsLoading(true);
        let newSchedule: WeeklySchedule = {};

        if (selectedClassId && !selectedTeacherId) {
            newSchedule = initializeEmptyAnnualSchedule({}, selectedClassId, school?.fromHour ?? 1, school?.toHour ?? 10);
            newSchedule = populateAllClassesSchedule(annualAltScheduleTable, newSchedule);
        } else if (!selectedClassId && selectedTeacherId) {
            newSchedule = initializeEmptyAnnualSchedule({}, selectedTeacherId, school?.fromHour ?? 1, school?.toHour ?? 10);
            newSchedule = populateAllTeachersSchedule(annualAltScheduleTable, newSchedule);
        } else if (selectedClassId && selectedTeacherId) {
            newSchedule = initializeEmptyAnnualSchedule({}, selectedClassId, school?.fromHour ?? 1, school?.toHour ?? 10);
            newSchedule = populateAllClassesSchedule(annualAltScheduleTable, newSchedule);
        }

        setSchedule(newSchedule);
        setIsLoading(false);
    }, [selectedClassId, selectedTeacherId, annualAltScheduleTable, school]);

    const classesSelectOptions = () => {
        const sortedClasses = [...(classes || [])]
            .filter((c) => !c.activity)
            .sort((a, b) => compareHebrew(a.name, b.name));
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
        <AnnualAltViewContext.Provider
            value={{
                annualAltScheduleTable,
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
        </AnnualAltViewContext.Provider>
    );
};
