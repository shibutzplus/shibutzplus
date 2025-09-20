"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect, useRef } from "react";
import { getPublishedDatesOptions as getPublishedDatesOptions } from "@/resources/dayOptions";
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
import { getDailyScheduleAction } from "@/app/actions/GET/getDailyScheduleAction";

interface PortalContextType {
    selectedDate: string | undefined;
    handleDayChange: (value: string) => void;
    teacher: TeacherType | undefined;
    schoolId: string | undefined;
    mainPortalTable: PortalSchedule;
    setTeacherAndSchool: (schoolId?: string, teacherId?: string) => Promise<boolean>;
    handleSave: (rowId: string, hour: number, instructions?: string) => Promise<void>;
    publishDatesOptions: SelectOption[];
    isPortalLoading: boolean;
    isPublishLoading: boolean;
    isSaving: boolean;
    fetchPortalScheduleDate: (withCache?: boolean) => Promise<{
        success: boolean;
        error: string;
    }>;
    fetchPublishScheduleData: () => Promise<{
        success: boolean;
        error: string;
    }>;
    mainPublishTable: DailyScheduleType[];
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

    const [teacher, setTeacher] = useState<TeacherType | undefined>();
    const [schoolId, setSchoolId] = useState<string | undefined>();

    const [mainPortalTable, setMainPortalTable] = useState<PortalSchedule>({}); // Main state for table object storage
    const [mainPublishTable, setMainPublishTable] = useState<DailyScheduleType[]>([]);

    const [isPortalLoading, setIsPortalLoading] = useState<boolean>(true);
    const [isSaving, setIsSaving] = useState<boolean>(false);

    const [isPublishLoading, setIsPublishLoading] = useState<boolean>(true);

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
                setIsPortalLoading(true);
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
                    setIsPortalLoading(false);
                }
            } else {
                handleDayChange(""); // If no date is published, set `selectedDate` to empty so no data will be retrieved.
                setPublishDatesOptions([]);
            }
        };
        blockRef.current && fetchDateOptions();
    }, [teacher]);

    const populateTableFromStorage = () => {
        const tableStorage = getSessionPortalTable();
        if (tableStorage && selectedDate && tableStorage[selectedDate]) {
            setMainPortalTable({ [selectedDate]: tableStorage[selectedDate] });
            setIsPortalLoading(false);
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

    const fetchPublishScheduleData = async () => {
        setIsPublishLoading(true);
        try {
            const schoolId = getSchoolCookie();
            if (!schoolId || !selectedDate) {
                setMainPublishTable([]);
                return { success: false, error: "" };
            }

            const response = await getDailyScheduleAction(schoolId, selectedDate, {
                isPrivate: false,
            });
            if (response.success && response.data) {
                setMainPublishTable(response.data);
                return { success: true, error: "" };
            } else {
                setMainPublishTable([]);
                return { success: false, error: response.message || messages.dailySchedule.error };
            }
        } catch (error) {
            console.error("Error fetching daily schedule:", error);
            setMainPublishTable([]);
            return { success: false, error: messages.dailySchedule.error };
        } finally {
            setIsPublishLoading(false);
        }
    };

    const fetchPortalScheduleDate = async (withCache: boolean = false) => {
        if (!teacher || !selectedDate) return { success: false, error: "" };
        try {
            setIsPortalLoading(true);
            if (withCache) {
                const populateFromStorage = populateTableFromStorage();
                if (populateFromStorage) return { success: true, error: "" };
            }

            const response = await getTeacherFullScheduleAction(teacher.id, selectedDate);
            if (response.success && response.data) {
                populatePortalTable(response.data);
                return { success: true, error: "" };
            } else {
                console.error("Failed to fetch daily schedule:", response.message);
                return { success: false, error: response.message || messages.dailySchedule.error };
            }
        } catch (error) {
            console.error("Error fetching daily schedule data:", error);
            return { success: false, error: messages.dailySchedule.error };
        } finally {
            setIsPortalLoading(false);
        }
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

    const value: PortalContextType = {
        selectedDate,
        handleDayChange,
        teacher,
        schoolId,
        mainPortalTable,
        setTeacherAndSchool,
        publishDatesOptions,
        isPortalLoading,
        isPublishLoading,
        handleSave,
        isSaving,
        fetchPortalScheduleDate,
        fetchPublishScheduleData,
        mainPublishTable,
    };

    return <PortalContext.Provider value={value}>{children}</PortalContext.Provider>;
};

// const refreshPortalTable = async (page: string) => {
//     if (!teacher || !selectedDate) return false;
//     try {
//         setIsPortalLoading(true);
//         if (page.includes(router.teacherPortal.p)) {
//             const response = await getTeacherFullScheduleAction(teacher.id, selectedDate);
//             if (response.success && response.data) {
//                 populatePortalTable(response.data);
//                 return true;
//             } else {
//                 console.error("Failed to fetch daily schedule:", response.message);
//                 return false;
//             }
//         } else {
//             const response = await fetchPublishScheduleData();
//             if (response) return true;
//             return false;
//         }
//     } catch (error) {
//         console.error("Error fetching daily schedule data:", error);
//         return false;
//     } finally {
//         setIsPortalLoading(false);
//     }
// };
