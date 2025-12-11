"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect, useRef } from "react";
import { getSchoolAction } from "@/app/actions/GET/getSchoolAction";
import { getTeacherByIdAction } from "@/app/actions/GET/getTeacherByIdAction";
import { SelectOption } from "@/models/types";
import { TeacherType } from "@/models/types/teachers";
import { getPublishedDatesOptions as getPublishedDatesOptions } from "@/resources/dayOptions";
import { SchoolSettingsType } from "@/models/types/settings";
import { chooseDefaultDate } from "@/utils/time";
import { selectSelectedDate } from "@/services/portalTeacherService";
import { getStorageTeacher } from "@/lib/localStorage";
import { DailySchedule } from "@/models/types/dailySchedule";
import { usePublished } from "@/hooks/portal/usePublished";

interface PortalContextType {
    teacher: TeacherType | undefined;
    schoolId: string | undefined;
    settings: SchoolSettingsType | undefined;
    selectedDate: string;
    isDatesLoading: boolean;
    handleDayChange: (value: string) => void;
    setTeacherAndSchool: (schoolId?: string, teacherId?: string) => Promise<boolean>;
    datesOptions: SelectOption[];
    handleRefreshDates: () => Promise<{ success: boolean; error: string; selected: string; options: SelectOption[] }>;

    isPublishLoading: boolean;
    hasFetched: boolean;
    mainPublishTable: DailySchedule;
    fetchPublishScheduleData: (
        overrideSchoolId?: string,
        overrideDate?: string,
        overrideTeacher?: TeacherType
    ) => Promise<boolean>;
    handlePublishedRefresh: (
        overrideSchoolId?: string,
        overrideDate?: string,
        overrideTeacher?: TeacherType
    ) => Promise<void>;
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
    const [settings, setSettings] = useState<SchoolSettingsType | undefined>();

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
                        setSettings(response.data.settings);
                        const res = getPublishedDatesOptions(response.data.publishDates);
                        if (res.length === 0) {
                            setDatesOptions([]);
                            setSelectedDate(chooseDefaultDate());
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
        options: SelectOption[];
    }> => {
        if (!teacher) {
            setDatesOptions([]);
            setSelectedDate("");
            return { success: false, error: "", selected: "", options: [] };
        }

        setIsDatesLoading(true);
        try {
            const response = await getSchoolAction(teacher.schoolId);
            if (response.success && response.data) {
                setSettings(response.data.settings);
                const options = getPublishedDatesOptions(response.data.publishDates);
                setDatesOptions(options);

                // Keep current if still valid; otherwise choose by time-based rule
                // Prioritize time-based default (Today/Tomorrow) if available in options
                // This ensures auto-refresh (and manual refresh) switches to the correct day when time passes.
                const timeBasedDate = chooseDefaultDate(options);
                const keepCurrent = !!selectedDate && options.some((o) => o.value === selectedDate);

                const nextSelected = timeBasedDate
                    ? timeBasedDate
                    : keepCurrent
                        ? selectedDate!
                        : options.length > 0
                            ? options[0].value
                            : chooseDefaultDate();

                setSelectedDate(nextSelected);
                return { success: true, error: "", selected: nextSelected, options };
            } else {
                setDatesOptions([]);
                setSelectedDate(chooseDefaultDate());
                return { success: false, error: response.message || "", selected: "", options: [] };
            }
        } catch (err) {
            console.error("Error refreshing publish dates:", err);
            setDatesOptions([]);
            setSelectedDate("");
            return { success: false, error: "", selected: "", options: [] };
        } finally {
            setIsDatesLoading(false);
        }
    };

    const isValidPublishDate = datesOptions.some((d) => d.value === selectedDate);
    const dateToFetch = isValidPublishDate ? selectedDate : "";



    const { fetchPublishScheduleData, handlePublishedRefresh, mainPublishTable, isPublishLoading, hasFetched } =
        usePublished(schoolId, dateToFetch, teacher);

    const value: PortalContextType = {
        teacher,
        schoolId,
        settings,
        selectedDate,
        isDatesLoading,
        handleDayChange,
        setTeacherAndSchool,
        datesOptions,
        handleRefreshDates,

        isPublishLoading,
        hasFetched,
        mainPublishTable,
        handlePublishedRefresh,
        fetchPublishScheduleData,
    };

    return <PortalContext.Provider value={value}>{children}</PortalContext.Provider>;
};
