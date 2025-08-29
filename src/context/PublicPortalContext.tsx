"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect, useRef } from "react";
import { gePublishedDatesOptions, getTomorrowOption } from "@/resources/dayOptions";
import { SelectOption } from "@/models/types";
import { TeacherType } from "@/models/types/teachers";
import { getTeacherByIdAction } from "@/app/actions/GET/getTeacherByIdAction";
import { getDailyByTeacherAction } from "@/app/actions/GET/getDailyByTeacherAction";
import { getSchoolAction } from "@/app/actions/GET/getSchoolAction";
import { DailyScheduleRequest, DailyScheduleType } from "@/models/types/dailySchedule";
import { PortalScheduleType } from "@/models/types/portalSchedule";
import { getDayNumberByDateString, getStringReturnDate } from "@/utils/time";
import { updateDailyTeacherCellAction } from "@/app/actions/PUT/updateDailyTeacherCellAction";
import { errorToast } from "@/lib/toast";
import messages from "@/resources/messages";

interface PublicPortalContextType {
    selectedDate: string;
    handleDayChange: (value: string) => void;
    teacher: TeacherType | undefined;
    teacherTableData: DailyScheduleType[];
    setTeacherById: (teacherId: string | undefined) => Promise<boolean>;
    getPublishDateOptions: (schoolId: string) => Promise<SelectOption[] | undefined>;
    updateRowDetails: (
        cellData: DailyScheduleType,
        change: {
            instructions: string;
            links: string;
        },
    ) => Promise<void>;
    switchReadAndWrite: () => void;
    handleSave: () => Promise<DailyScheduleType | undefined>;
    publishDatesOptions: SelectOption[];
    isLoading: boolean;
    onReadTable: boolean;
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
    const [teacherTableData, setTeacherTableData] = useState<DailyScheduleType[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isSaving, setIsSaving] = useState<boolean>(false);
    const [onReadTable, setOnReadTable] = useState<boolean>(false);
    const [queueRows, setQueueRows] = useState<{ id: string; data: DailyScheduleRequest }[]>([]);

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
        const fetchTeacherTableData = async () => {
            if (!teacher || !selectedDate) return;
            const type = onReadTable ? "sub" : "issue";
            const response = await getDailyByTeacherAction(type, teacher.id, selectedDate);
            if (response.success && response.data) {
                setTeacherTableData(response.data);
            } else {
                setTeacherTableData([]);
            }
        };
        fetchTeacherTableData();
    }, [selectedDate, teacher, onReadTable]);

    const switchReadAndWrite = () => {
        setOnReadTable((prev) => !prev);
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

    const updateRowDetails = async (
        cellData: DailyScheduleType,
        change: {
            instructions: string;
            links: string;
        },
    ) => {
        const dailyCellData: DailyScheduleRequest = {
            date: getStringReturnDate(selectedDate),
            day: getDayNumberByDateString(selectedDate).toString(),
            columnId: cellData.columnId,
            hour: cellData.hour,
            school: cellData.school,
            class: cellData.class,
            subject: cellData.subject,
            subTeacher: cellData.subTeacher,
            issueTeacher: cellData.issueTeacher,
            issueTeacherType: cellData.issueTeacherType,
            position: cellData.position,
            instructions: change.instructions,
            links: change.links,
        };
        setQueueRows((prev) => [...prev, { id: cellData.id, data: dailyCellData }]);
    };

    const handleSave = async () => {
        try {
            setIsSaving(true);
            for (const row of queueRows) {
                const response = await updateDailyTeacherCellAction(row.id, row.data);
                if (response?.success && response.data) {
                    return response.data;
                }
            }
        } catch (error) {
            console.error("Error updating daily schedule entry:", error);
            errorToast(messages.dailySchedule.error);
        } finally {
            setIsSaving(false);
            setQueueRows([]);
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
        updateRowDetails,
        switchReadAndWrite,
        handleSave,
        onReadTable,
        isSaving,
    };

    return <PublicPortalContext.Provider value={value}>{children}</PublicPortalContext.Provider>;
};
