"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect, useRef } from "react";
import { gePublishedDatesOptions, getTomorrowOption } from "@/resources/dayOptions";
import { SelectOption } from "@/models/types";
import { TeacherType } from "@/models/types/teachers";
import { getTeacherByIdAction } from "@/app/actions/GET/getTeacherByIdAction";
import { getDailyByTeacherAction } from "@/app/actions/GET/getDailyByTeacherAction";
import { getSchoolAction } from "@/app/actions/GET/getSchoolAction";
import {
    DailyScheduleRequest,
    DailyScheduleType,
    GetDailyScheduleResponse,
} from "@/models/types/dailySchedule";
import { PortalPageType } from "@/models/types/portalSchedule";
import { updateDailyTeacherCellAction } from "@/app/actions/PUT/updateDailyTeacherCellAction";
import { errorToast } from "@/lib/toast";
import messages from "@/resources/messages";
import getTeacherFullScheduleAction from "@/app/actions/GET/getTeacherFullScheduleAction";

interface PublicPortalContextType {
    selectedDate: string;
    handleDayChange: (value: string) => void;
    teacher: TeacherType | undefined;
    teacherTableData: DailyScheduleType[] | undefined;
    setTeacherById: (teacherId: string | undefined) => Promise<boolean>;
    getPublishDateOptions: (schoolId: string) => Promise<SelectOption[] | undefined>;
    switchReadAndWrite: (mode: PortalPageType) => void;
    handleSave: (
        dataId: string,
        data: DailyScheduleRequest,
    ) => Promise<DailyScheduleType | undefined>;
    publishDatesOptions: SelectOption[];
    isLoading: boolean;
    pageMode: PortalPageType;
    isSaving: boolean;
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
    const [publishDatesOptions, setPublishDatesOptions] = useState<SelectOption[]>([]);
    const [teacher, setTeacher] = useState<TeacherType | undefined>();
    const [teacherTableData, setTeacherTableData] = useState<DailyScheduleType[] | undefined>();
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isSaving, setIsSaving] = useState<boolean>(false);
    const [pageMode, setPageMode] = useState<PortalPageType>("read");

    const blockRef = useRef<boolean>(true);
    useEffect(() => {
        const fetchDateOptions = async () => {
            if (teacher) {
                const options = await getPublishDateOptions(teacher.schoolId);
                setPublishDatesOptions(options || []);
                handleDayChange(options?.[0].value || getTomorrowOption());
                blockRef.current = false;
            } else {
                handleDayChange(getTomorrowOption());
                setPublishDatesOptions([]);
            }
        };
        blockRef.current && fetchDateOptions();
    }, [teacher]);

    useEffect(() => {
        // TODO: add cache
        getTeacherTableData(pageMode);
    }, [selectedDate, pageMode]);

    const switchReadAndWrite = async (mode: PortalPageType) => {
        setPageMode(mode);
    };

    const getTeacherTableData = async (mode: PortalPageType) => {
        if (!teacher || !selectedDate) return;
        let response: GetDailyScheduleResponse | undefined;
        setIsLoading(true);
        try {
            if (mode === "read") {
                response = await getTeacherFullScheduleAction(
                    teacher.schoolId,
                    teacher.id,
                    selectedDate,
                );
            } else if (mode === "write") {
                response = await getDailyByTeacherAction(teacher.id, selectedDate);
            }
    
            if (response && response.success && response.data) {
                setTeacherTableData(response.data);
            } else {
                setTeacherTableData([]);
            }
        } catch (error) {
            console.error("Error fetching teacher table data:", error);
        } finally {
            setIsLoading(false);
        }
    };

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

    const setTeacherById = async (teacherId: string | undefined) => {
        try {
            if (!teacherId) return false;
            const response = await getTeacherByIdAction(teacherId);
            if (response.success && response.data) {
                setTeacher(response.data);
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

    const value: PublicPortalContextType = {
        selectedDate,
        handleDayChange,
        teacher,
        teacherTableData,
        setTeacherById,
        getPublishDateOptions,
        publishDatesOptions,
        isLoading,
        switchReadAndWrite,
        handleSave,
        pageMode,
        isSaving,
    };

    return <PublicPortalContext.Provider value={value}>{children}</PublicPortalContext.Provider>;
};
