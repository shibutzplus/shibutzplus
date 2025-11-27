"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect, useRef } from "react";
import { getSchoolAction } from "@/app/actions/GET/getSchoolAction";
import { getTeacherByIdAction } from "@/app/actions/GET/getTeacherByIdAction";
import { SelectOption } from "@/models/types";
import { TeacherType } from "@/models/types/teachers";
import { getPublishedDatesOptions as getPublishedDatesOptions } from "@/resources/dayOptions";
import { chooseDefaultDate } from "@/utils/time";
import { selectSelectedDate } from "@/services/portalTeacherService";
import { getStorageTeacher } from "@/lib/localStorage";
import { PortalSchedule, TeacherScheduleType } from "@/models/types/portalSchedule";
import { DailySchedule } from "@/models/types/dailySchedule";
import { usePortal } from "@/hooks/portal/usePortal";
import { usePublished } from "@/hooks/portal/usePublished";

interface PortalContextType {
    teacher: TeacherType | undefined;
    schoolId: string | undefined;
    selectedDate: string;
    isDatesLoading: boolean;
    handleDayChange: (value: string) => void;
    setTeacherAndSchool: (schoolId?: string, teacherId?: string) => Promise<boolean>;
    datesOptions: SelectOption[];
    handleRefreshDates: () => Promise<{ success: boolean; error: string; selected: string }>;

    // isPortalLoading: boolean;
    // isSavingLoading: boolean;
    // mainPortalTable: PortalSchedule;
    // fetchPortalScheduleDate: (teacher?: TeacherType) => Promise<boolean>;
    // handlePortalRefresh: (teacher?: TeacherType) => Promise<void>;
    // saveInstractions: (instructions: string, row?: TeacherScheduleType) => Promise<void>;

    isPublishLoading: boolean;
    mainPublishTable: DailySchedule;
    fetchPublishScheduleData: () => Promise<boolean>;
    handlePublishedRefresh: () => Promise<void>;
}

const PortalContext = createContext<PortalContextType | undefined>(undefined);

export const usePortalContext = () => {
    const context = useContext(PortalContext);
    if (context === undefined) {
        throw new Error("usePortal must be used within an PortalProvider");
    }
    return context;
};

type PortalProviderProps = {
    children: ReactNode;
};

export const PortalProvider: React.FC<PortalProviderProps> = ({ children }) => {
    const [teacher, setTeacher] = useState<TeacherType | undefined>();
    const [schoolId, setSchoolId] = useState<string | undefined>();

    const [selectedDate, setSelectedDate] = useState<string>("");

    const [datesOptions, setDatesOptions] = useState<SelectOption[]>([]);
    const [isDatesLoading, setIsDatesLoading] = useState(false);

    useEffect(() => {
        // One-time init from local storage
        if (!schoolId) {
            const storedTeacher = getStorageTeacher();
            if (storedTeacher) setSchoolId(storedTeacher.schoolId);
        }
        if (!teacher) {
            const storedTeacher = getStorageTeacher();
            if (storedTeacher) setTeacher(storedTeacher);
        }
    }, []);

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

    const handleDayChange = (value: string) => {
        setSelectedDate(value);
    };

    // -- Dates -- //

    const blockRef = useRef<boolean>(true);
    useEffect(() => {
        const fetchPublishedDates = async () => {
            if (teacher) {
                setIsDatesLoading(true);
                try {
                    const response = await getSchoolAction(teacher.schoolId);
                    if (response.success && response.data) {
                        const res = getPublishedDatesOptions(response.data.publishDates);
                        if (res.length === 0) {
                            setDatesOptions([]);
                            setSelectedDate("");
                            return;
                        }
                        setDatesOptions(res);
                        handleDayChange(
                            chooseDefaultDate(res) ??
                                selectSelectedDate(res)?.value ??
                                res[0].value,
                        );
                        blockRef.current = false;
                    }
                } catch (error) {
                    console.error("Error fetching publish dates:", error);
                    setDatesOptions([]);
                    setSelectedDate("");
                } finally {
                    setIsDatesLoading(false);
                }
            } else {
                handleDayChange("");
                setDatesOptions([]);
            }
        };
        blockRef.current && fetchPublishedDates();
    }, [teacher]);

    // Initialize selectedDate when datesOptions becomes available
    useEffect(() => {
        if (datesOptions.length > 0 && !selectedDate) {
            const initialDate =
                chooseDefaultDate(datesOptions) ??
                selectSelectedDate(datesOptions)?.value ??
                datesOptions[0].value;
            setSelectedDate(initialDate);
        }
    }, [datesOptions]);

    const handleRefreshDates = async (): Promise<{
        success: boolean;
        error: string;
        selected: string;
    }> => {
        if (!teacher) {
            setDatesOptions([]);
            setSelectedDate("");
            return { success: false, error: "", selected: "" };
        }

        setIsDatesLoading(true);
        try {
            const response = await getSchoolAction(teacher.schoolId);
            if (response.success && response.data) {
                const options = getPublishedDatesOptions(response.data.publishDates);
                setDatesOptions(options);

                // Keep current if still valid; otherwise choose by time-based rule
                const keepCurrent = !!selectedDate && options.some((o) => o.value === selectedDate);
                const nextSelected = options.length
                    ? keepCurrent
                        ? selectedDate!
                        : (chooseDefaultDate(options) ??
                          selectSelectedDate(options)?.value ??
                          options[0].value)
                    : "";

                setSelectedDate(nextSelected);
                return { success: true, error: "", selected: nextSelected };
            } else {
                setDatesOptions([]);
                setSelectedDate("");
                return { success: false, error: response.message || "", selected: "" };
            }
        } catch (err) {
            console.error("Error refreshing publish dates:", err);
            setDatesOptions([]);
            setSelectedDate("");
            return { success: false, error: "", selected: "" };
        } finally {
            setIsDatesLoading(false);
        }
    };

    // const {
    //     fetchPortalScheduleDate,
    //     handlePortalRefresh,
    //     saveInstractions,
    //     mainPortalTable,
    //     isPortalLoading,
    //     isSavingLoading,
    // } = usePortal(schoolId, selectedDate);

    const { fetchPublishScheduleData, handlePublishedRefresh, mainPublishTable, isPublishLoading } =
        usePublished(schoolId, selectedDate, teacher);

    const value: PortalContextType = {
        teacher,
        schoolId,
        selectedDate,
        isDatesLoading,
        handleDayChange,
        setTeacherAndSchool,
        datesOptions,
        handleRefreshDates,

        // isPortalLoading,
        // isSavingLoading,
        // mainPortalTable,
        // handlePortalRefresh,
        // fetchPortalScheduleDate,
        // saveInstractions,

        isPublishLoading,
        mainPublishTable,
        handlePublishedRefresh,
        fetchPublishScheduleData,
    };

    return <PortalContext.Provider value={value}>{children}</PortalContext.Provider>;
};
