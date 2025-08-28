"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect, useRef } from "react";
import { useMainContext } from "./MainContext";
import { gePublishedDatesOptions, getTomorrowOption } from "@/resources/dayOptions";
import { SelectOption } from "@/models/types";
import { TeacherType } from "@/models/types/teachers";
import { getTeacherByIdAction } from "@/app/actions/GET/getTeacherByIdAction";
import { getDailyByTeacherAction } from "@/app/actions/GET/getDailyByTeacherAction";
import { getSchoolAction } from "@/app/actions/GET/getSchoolAction";
import { DailyScheduleRequest, DailyScheduleType } from "@/models/types/dailySchedule";
import { PortalScheduleType } from "@/models/types/portalSchedule";
import { createNewTeacherCellData } from "@/services/dailyScheduleService";
import { addDailyTeacherCellAction } from "@/app/actions/POST/addDailyTeacherCellAction";
import { getDayNumberByDateString, getStringReturnDate } from "@/utils/time";
import { updateDailyTeacherCellAction } from "@/app/actions/PUT/updateDailyTeacherCellAction";

interface PublicPortalContextType {
    selectedDate: string;
    handleDayChange: (value: string) => void;
    teacher: TeacherType | undefined;
    teacherTableData: DailyScheduleType[];
    setTeacherById: (teacherId: string | undefined) => Promise<boolean>;
    getPublishDateOptions: (schoolId: string) => Promise<SelectOption[] | undefined>;
    publishDatesOptions: SelectOption[];
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
    const [publishDatesOptions, setPublishDatesOptions] = useState<SelectOption[]>([]);
    const [teacher, setTeacher] = useState<TeacherType | undefined>();
    const [teacherTableData, setTeacherTableData] = useState<DailyScheduleType[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const blockRef = useRef<boolean>(true);
    useEffect(() => {
        const fetchOptions = async () => {
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
        blockRef.current && fetchOptions();
    }, [teacher]);

    useEffect(() => {
        const fetchTeacherTableData = async () => {
            if (!teacher || !selectedDate) return;
            const response = await getDailyByTeacherAction(teacher.id, selectedDate);
            if (response.success && response.data) {
                setTeacherTableData(response.data);
            } else {
                setTeacherTableData([]);
            }
        };
        fetchTeacherTableData();
    }, [selectedDate, teacher]);

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

    const addNewCell = async (cellData: DailyScheduleType, details: PortalScheduleType) => {
        const dailyCellData: DailyScheduleRequest = {
            date: getStringReturnDate(selectedDate),
            day: getDayNumberByDateString(selectedDate).toString(),
            columnId: cellData.id,
            hour: details.hour,
            school: cellData.school,
            class: cellData.class,
            subject: cellData.subject,
            subTeacher: cellData.subTeacher,
            issueTeacher: cellData.issueTeacher,
            issueTeacherType: cellData.issueTeacherType,
            position: cellData.position,
            instructions: details.instructions,
            links: details.links,
        };
        if (dailyCellData) {
            const response = await addDailyTeacherCellAction(dailyCellData);
            if (response?.success && response.data) {
                return response.data;
            }
        }
        return undefined;
    };

    const updateCell = async (cellData: DailyScheduleType, details: PortalScheduleType) => {
        const dailyCellData: DailyScheduleRequest = {
            date: getStringReturnDate(selectedDate),
            day: getDayNumberByDateString(selectedDate).toString(),
            columnId: cellData.id,
            hour: details.hour,
            school: cellData.school,
            class: cellData.class,
            subject: cellData.subject,
            subTeacher: cellData.subTeacher,
            issueTeacher: cellData.issueTeacher,
            issueTeacherType: cellData.issueTeacherType,
            position: cellData.position,
            instructions: details.instructions,
            links: details.links,
        };
        const response = await updateDailyTeacherCellAction(cellData.id, dailyCellData);

        if (response?.success && response.data) {
            return response.data;
        }
        return undefined;
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
    };

    return <PublicPortalContext.Provider value={value}>{children}</PublicPortalContext.Provider>;
};
