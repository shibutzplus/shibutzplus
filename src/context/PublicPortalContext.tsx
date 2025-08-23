"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { useMainContext } from "./MainContext";
import { gePublishedDatesOptions, getTomorrowOption } from "@/resources/dayOptions";
import { SelectOption } from "@/models/types";
import { TeacherType } from "@/models/types/teachers";
import { getTeacherByIdAction } from "@/app/actions/GET/getTeacherByIdAction";
import { getDailyByTeacherAction } from "@/app/actions/GET/getDailyByTeacherAction";
import { DailySchedule, DailyScheduleType } from "@/models/types/dailySchedule";
import { getSchoolAction } from "@/app/actions/GET/getSchoolAction";
import { tr } from "zod/v4/locales";

interface PublicPortalContextType {
    selectedDate: string;
    handleDayChange: (value: string) => void;
    teacher: TeacherType | undefined;
    populateTeacherTable: (teacherId: string | undefined) => Promise<TeacherType | undefined>;
    teacherTableData: DailyScheduleType[];
    getPublishDateOptions: (schoolId: string) => Promise<SelectOption[] | undefined>;
    isLoading: boolean;
}

const PublicPortalContext = createContext<PublicPortalContextType | undefined>(undefined);

export const usePublicPortal = () => {
    const context = useContext(PublicPortalContext);
    if (context === undefined) {
        throw new Error("usePublicPortal must be used within an PublicPortalProvider");
    }
    return context;
};

export const PublicPortalProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [selectedDate, setSelectedDayId] = useState<string>(getTomorrowOption());
    const [teacher, setTeacher] = useState<TeacherType | undefined>();
    const [teacherTableData, setTeacherTableData] = useState<DailyScheduleType[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const getPublishDateOptions = async (schoolId: string) => {
        setIsLoading(true);
        try {
            const response = await getSchoolAction(schoolId);
            if (response.success && response.data) {
                return gePublishedDatesOptions(response.data.publishDates);
            }
        } catch (error) {
            console.error("Error fetching school:", error);
            return [];
        } finally {
            setIsLoading(false);
        }
    };

    const handleDayChange = (value: string) => {
        setSelectedDayId(value);
    };

    const populateTeacherTable = async (teacherId: string | undefined) => {
        try {
            let teacherObj = teacher;
            if (teacherId && (!teacher || teacher?.id !== teacherId)) {
                const response = await getTeacherByIdAction(teacherId);
                if (response.success && response.data) {
                    setTeacher(response.data);
                    teacherObj = response.data;
                }
            }

            if (teacherId && selectedDate) {
                const response = await getDailyByTeacherAction(teacherId, selectedDate);
                if (response.success && response.data) {
                    setTeacherTableData(response.data);
                } else {
                    setTeacherTableData([]);
                }
            }
            return teacherObj;
        } catch (error) {
            console.error("Error fetching teacher by ID:", error);
        }
    };

    const value: PublicPortalContextType & { teacherTableData: DailyScheduleType[] } = {
        selectedDate,
        handleDayChange,
        teacher,
        populateTeacherTable,
        teacherTableData,
        getPublishDateOptions,
        isLoading,
    };

    return <PublicPortalContext.Provider value={value}>{children}</PublicPortalContext.Provider>;
};
