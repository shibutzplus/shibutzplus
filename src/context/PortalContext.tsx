"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect, useRef } from "react";
import {
    getPublishedDatesOptions as getPublishedDatesOptions,
    getTomorrowOption,
} from "@/resources/dayOptions";
import { SelectOption } from "@/models/types";
import { TeacherType } from "@/models/types/teachers";
import { getSchoolAction } from "@/app/actions/GET/getSchoolAction";
import { DailyScheduleType } from "@/models/types/dailySchedule";
import { errorToast } from "@/lib/toast";
import messages from "@/resources/messages";
import { selectSelectedDate } from "@/services/portalTeacherService";
import {
    getSessionPortalTable,
    getSessionTeacher,
    setSessionPortalTable,
    setSessionTeacher,
} from "@/lib/sessionStorage";
import { getSchoolCookie } from "@/lib/cookies";
import { getDateReturnString } from "@/utils/time";
import { PortalSchedule } from "@/models/types/portalSchedule";
import { getTeacherByIdAction } from "@/app/actions/GET/getTeacherByIdAction";
import getTeacherFullScheduleAction from "@/app/actions/GET/getTeacherFullScheduleAction";
import { updateDailyInstructionAction } from "@/app/actions/PUT/updateDailyInstractionAction";

interface PortalContextType {
    selectedDate: string | undefined;
    handleDayChange: (value: string) => void;
    teacher: TeacherType | undefined;
    schoolId: string | undefined;
    mainPortalTable: PortalSchedule;
    setTeacherAndSchool: (schoolId?: string, teacherId?: string) => Promise<boolean>;
    handleSave: (rowId: string, hour: number, instructions?: string) => Promise<void>;
    refreshPortalTable: () => Promise<boolean>;
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
    const [selectedDate, setSelectedDayId] = useState<string | undefined>();
    const [publishDatesOptions, setPublishDatesOptions] = useState<SelectOption[]>([]);

    const [mainPortalTable, setMainPortalTable] = useState<PortalSchedule>({}); // Main state for table object storage

    const [teacher, setTeacher] = useState<TeacherType | undefined>();
    const [schoolId, setSchoolId] = useState<string | undefined>();
    const [isLoading, setIsLoading] = useState<boolean>(true);
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
                handleDayChange(""); // If no date is published, set `selectedDate` to empty so no data will be retrieved.
                setPublishDatesOptions([]);
            }
        };
        blockRef.current && fetchDateOptions();
    }, [teacher]);

    useEffect(() => {
        const fetchDataForDate = async () => {
            if (!teacher || !selectedDate) return;
            try {
                setIsLoading(true);
                const populateFromStorage = populateTableFromStorage();
                if (populateFromStorage) return;

                const response = await getTeacherFullScheduleAction(teacher.id, selectedDate);
                if (response.success && response.data) {
                    populatePortalTable(response.data);
                } else {
                    console.error("Failed to fetch daily schedule:", response.message);
                }
            } catch (error) {
                console.error("Error fetching daily schedule data:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchDataForDate();
    }, [selectedDate, teacher]);

    const populateTableFromStorage = () => {
        const tableStorage = getSessionPortalTable();
        if (tableStorage && selectedDate && tableStorage[selectedDate]) {
            setMainPortalTable({ [selectedDate]: tableStorage[selectedDate] });
            setIsLoading(false);
            return true;
        }
        return false;
    };

    const populatePortalTable = async (dataColumns: DailyScheduleType[]) => {
        if (!dataColumns || !Array.isArray(dataColumns)) return;

        const portalSchedule: PortalSchedule = { ...mainPortalTable };
        dataColumns.forEach((entry) => {
            const date = getDateReturnString(entry.date);
            const hour = String(entry.hour);
            if (!portalSchedule[date]) portalSchedule[date] = {};
            portalSchedule[date][hour] = {
                DBid: entry.id,
                columnId: entry.columnId,
                hour: entry.hour,
                school: entry.school,
                class: entry.class,
                subject: entry.subject,
                subTeacher: entry.subTeacher,
                issueTeacher: entry.issueTeacher,
                event: entry.event,
                instructions: entry.instructions,
            };
        });
        setMainPortalTable(portalSchedule);
        setSessionPortalTable(portalSchedule);
    };

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
                setSessionTeacher(response.data);
                return true;
            }
            return false;
        } catch (error) {
            console.error("Error fetching teacher by ID:", error);
            return false;
        }
    };

    const handleSave = async (rowId: string, hour: number, instructions?: string) => {
        try {
            setIsSaving(true);
            if (!selectedDate) return;
            const response = await updateDailyInstructionAction(selectedDate, rowId, instructions);
            if (response.success) {
                const portalSchedule = { ...mainPortalTable };
                portalSchedule[selectedDate][`${hour}`].instructions = instructions;
                setMainPortalTable(portalSchedule);
                setSessionPortalTable(portalSchedule);
            } else {
                errorToast(messages.dailySchedule.error);
            }
        } catch (error) {
            console.error("Error updating daily schedule entry:", error);
            errorToast(messages.dailySchedule.error);
        } finally {
            setIsSaving(false);
        }
    };

    const refreshPortalTable = async () => {
        if (!teacher || !selectedDate) return false;
        try {
            setIsLoading(true);
            const response = await getTeacherFullScheduleAction(teacher.id, selectedDate);
            if (response.success && response.data) {
                populatePortalTable(response.data);
                return true;
            } else {
                console.error("Failed to fetch daily schedule:", response.message);
                return false;
            }
        } catch (error) {
            console.error("Error fetching daily schedule data:", error);
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    const value: PortalContextType = {
        selectedDate,
        handleDayChange,
        teacher,
        schoolId,
        mainPortalTable,
        setTeacherAndSchool,
        publishDatesOptions,
        isLoading,
        handleSave,
        refreshPortalTable,
        isSaving,
    };

    return <PortalContext.Provider value={value}>{children}</PortalContext.Provider>;
};
