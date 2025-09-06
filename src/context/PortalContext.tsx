"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect, useRef } from "react";
import {
    getPublishedDatesOptions as getPublishedDatesOptions,
    getTomorrowOption,
} from "@/resources/dayOptions";
import { SelectOption } from "@/models/types";
import { TeacherType } from "@/models/types/teachers";
import { getTeacherByIdAction } from "@/app/actions/GET/getTeacherByIdAction";
import { getSchoolAction } from "@/app/actions/GET/getSchoolAction";
import { DailyScheduleRequest, DailyScheduleType } from "@/models/types/dailySchedule";
import { updateDailyTeacherCellAction } from "@/app/actions/PUT/updateDailyTeacherCellAction";
import { errorToast } from "@/lib/toast";
import messages from "@/resources/messages";
import { selectSelectedDate } from "@/services/portalTeacherService";
import { getSessionTeacher } from "@/lib/sessionStorage";
import { getSchoolCookie } from "@/lib/cookies";

interface PortalContextType {
    selectedDate: string;
    handleDayChange: (value: string) => void;
    teacher: TeacherType | undefined;
    schoolId: string | undefined;
    setTeacherAndSchool: (schoolId?: string, teacherId?: string) => Promise<boolean>;
    handleSave: (
        dataId: string,
        data: DailyScheduleRequest,
    ) => Promise<DailyScheduleType | undefined>;
    publishDatesOptions: SelectOption[];
    isLoading: boolean;
    isSaving: boolean;
}

const PortalContext = createContext<PortalContextType | undefined>(undefined);

export const usePortal = () => {
    const context = useContext(PortalContext);
    if (context === undefined) {
        throw new Error("usePortal must be used within an PortalProvider");
    }
    return context;
};

export const PortalProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [selectedDate, setSelectedDayId] = useState<string>(getTomorrowOption());
    const [publishDatesOptions, setPublishDatesOptions] = useState<SelectOption[]>([]);
    const [teacher, setTeacher] = useState<TeacherType | undefined>();
    const [schoolId, setSchoolId] = useState<string | undefined>();
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isSaving, setIsSaving] = useState<boolean>(false);

    useEffect(() => {
        if (!schoolId) {
            const cookieTeacher = getSchoolCookie();
            if (cookieTeacher) setSchoolId(cookieTeacher);
        }
        if (!teacher) {
            const sessionTeacher = getSessionTeacher();
            if (sessionTeacher) setTeacher(sessionTeacher);
        }
    }, []);

    const blockRef = useRef<boolean>(true);
    useEffect(() => {
        const fetchDateOptions = async () => {
            if (teacher) {
                setIsLoading(true);
                try {
                    const response = await getSchoolAction(teacher.schoolId);
                    if (response.success && response.data) {
                        const res = getPublishedDatesOptions(response.data.publishDates);
                        if (res.length === 0) {
                            setPublishDatesOptions([]);
                            return;
                        }
                        setPublishDatesOptions(res);
                        handleDayChange(selectSelectedDate(res)?.value);
                        blockRef.current = false;
                    }
                } catch (error) {
                    console.error("Error fetching publish dates:", error);
                    setPublishDatesOptions([]);
                } finally {
                    setIsLoading(false);
                }
            } else {
                handleDayChange(getTomorrowOption());
                setPublishDatesOptions([]);
            }
        };
        blockRef.current && fetchDateOptions();
    }, [teacher]);

    const handleDayChange = (value: string) => {
        setSelectedDayId(value);
    };

    const setTeacherAndSchool = async (schoolId?: string, teacherId?: string) => {
        try {
            if (!teacherId || !schoolId) return false;
            const response = await getTeacherByIdAction(teacherId);
            if (response.success && response.data) {
                setTeacher(response.data);
                setSchoolId(schoolId);
                return true;
            }
            return false;
        } catch (error) {
            console.error("Error fetching teacher by ID:", error);
            return false;
        }
    };

    const handleSave = async (dataId: string, data: DailyScheduleRequest) => {
        try {
            setIsSaving(true);
            const response = await updateDailyTeacherCellAction(dataId, data);
            if (response?.success && response.data) {
                return response.data;
            }
        } catch (error) {
            console.error("Error updating daily schedule entry:", error);
            errorToast(messages.dailySchedule.error);
        } finally {
            setIsSaving(false);
        }
    };

    const value: PortalContextType = {
        selectedDate,
        handleDayChange,
        teacher,
        schoolId,
        setTeacherAndSchool,
        publishDatesOptions,
        isLoading,
        handleSave,
        isSaving,
    };

    return <PortalContext.Provider value={value}>{children}</PortalContext.Provider>;
};
