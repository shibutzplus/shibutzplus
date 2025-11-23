"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect, useRef } from "react";
import { getSchoolAction } from "@/app/actions/GET/getSchoolAction";
import { getTeacherByIdAction } from "@/app/actions/GET/getTeacherByIdAction";
import getTeacherFullScheduleAction from "@/app/actions/GET/getTeacherFullScheduleAction";
import { getDailyScheduleAction } from "@/app/actions/GET/getDailyScheduleAction";
import { updateDailyInstructionAction } from "@/app/actions/PUT/updateDailyInstractionAction";
import { SelectOption } from "@/models/types";
import { TeacherType } from "@/models/types/teachers";
import { DailyScheduleType } from "@/models/types/dailySchedule";
import { PortalSchedule } from "@/models/types/portalSchedule";
import { getPublishedDatesOptions as getPublishedDatesOptions } from "@/resources/dayOptions";
import messages from "@/resources/messages";
import { errorToast } from "@/lib/toast";
import { getDateReturnString } from "@/utils/time";
import { selectSelectedDate } from "@/services/portalTeacherService";
import { getStorageTeacher } from "@/lib/localStorage";

interface PortalContextType {
    selectedDate: string | undefined;
    handleDayChange: (value: string) => void;
    teacher: TeacherType | undefined;
    schoolId: string | undefined;
    mainPortalTable: PortalSchedule;
    setTeacherAndSchool: (schoolId?: string, teacherId?: string) => Promise<boolean>;
    handleSave: (
        rowId: string,
        hour: number,
        instructions?: string,
        schoolId?: string,
        issueTeacherId?: string,
        subTeacherId?: string,
    ) => Promise<void>;
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
    refreshPublishDates: () => Promise<{ success: boolean; error: string; selected: string }>;
}

const PortalContext = createContext<PortalContextType | undefined>(undefined);

export const usePortal = () => {
    const context = useContext(PortalContext);
    if (context === undefined) {
        throw new Error("usePortal must be used within an PortalProvider");
    }
    return context;
};

// init props for controlled one-time initialization
type PortalProviderProps = {
    children: ReactNode;
    initTeacherId?: string;
    initSchoolId?: string;
    initDate?: string;
};

export const PortalProvider: React.FC<PortalProviderProps> = ({
    children,
    initTeacherId,
    initSchoolId,
    initDate,
}) => {
    const [selectedDate, setSelectedDayId] = useState<string | undefined>();
    const [publishDatesOptions, setPublishDatesOptions] = useState<SelectOption[]>([]);

    const [teacher, setTeacher] = useState<TeacherType | undefined>();
    const [schoolId, setSchoolId] = useState<string | undefined>();

    const [mainPortalTable, setMainPortalTable] = useState<PortalSchedule>({});
    const [mainPublishTable, setMainPublishTable] = useState<DailyScheduleType[]>([]);

    const [isPortalLoading, setIsPortalLoading] = useState<boolean>(true);
    const [isSaving, setIsSaving] = useState<boolean>(false);

    const [isPublishLoading, setIsPublishLoading] = useState<boolean>(true);

    // One-time init from local storage (fallback when init props are not provided)
    useEffect(() => {
        if (!schoolId) {
            const storedTeacher = getStorageTeacher();
            if (storedTeacher) setSchoolId(storedTeacher.schoolId);
        }
        if (!teacher) {
            const storedTeacher = getStorageTeacher();
            if (storedTeacher) setTeacher(storedTeacher);
        }
    }, []);

    // Helper: choose default date based on current time (before/after 16:00)
    // - Before 16:00: prefer today if exists, else first available
    // - After 16:00: prefer tomorrow if exists, else today, else first available
    const chooseDefaultDate = (options: SelectOption[]): string | undefined => {
        if (!options || options.length === 0) return "";
        const now = new Date();
        const hour = now.getHours();
        const today = getDateReturnString(now);
        const tomorrow = getDateReturnString(new Date(now.getTime() + 24 * 60 * 60 * 1000));

        const has = (val: string | undefined) => !!val && options.some((o) => o.value === val);

        if (hour < 16) {
            if (has(today)) return today;
            return options[0].value;
        } else {
            if (has(tomorrow)) return tomorrow;
            if (has(today)) return today;
            return options[0].value;
        }
    };

    const blockRef = useRef<boolean>(true);

    // One-time controlled init from props
    const didInitFromProps = useRef<boolean>(false);
    useEffect(() => {
        // Guard to run only once on mount
        if (didInitFromProps.current) return;
        didInitFromProps.current = true;

        // If init props provided from caller, initialize state once and prevent auto date override
        const init = async () => {
            if (initDate) {
                // Set selected date explicitly from caller
                setSelectedDayId(initDate);
            }
            if (initSchoolId && initTeacherId) {
                // Prevent fetchDateOptions effect from overriding initDate
                blockRef.current = false;
                try {
                    const res = await getTeacherByIdAction(initTeacherId);
                    if (res.success && res.data) {
                        setTeacher(res.data);
                        setSchoolId(initSchoolId);
                    }
                } catch (e) {
                    console.error("Error initializing teacher from props:", e);
                }
            }
        };
        init();
        // Dependencies intentionally empty to ensure one-time behavior
    }, []); // do not add init* deps to keep one-time init

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
                        handleDayChange(
                            chooseDefaultDate(res) ??
                                selectSelectedDate(res)?.value ??
                                res[0].value,
                        );
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

    useEffect(() => {
        if (!selectedDate) return;
        fetchPortalScheduleDate();
        fetchPublishScheduleData();
    }, [selectedDate, teacher?.id, schoolId]);

    const populatePortalTable = (dataColumns: DailyScheduleType[]) => {
        if (!selectedDate) return;

        const next: PortalSchedule = { ...mainPortalTable };

        next[selectedDate] = {};

        if (Array.isArray(dataColumns) && dataColumns.length > 0) {
            for (const entry of dataColumns) {
                const date = getDateReturnString(entry.date);
                if (date !== selectedDate) continue;

                const hour = String(entry.hour);
                next[selectedDate]![hour] = {
                    DBid: entry.id,
                    columnId: entry.columnId,
                    hour: entry.hour,
                    schoolId: entry.school?.id,
                    school: entry.school,
                    class: entry.class,
                    subject: entry.subject,
                    subTeacher: entry.subTeacher,
                    issueTeacher: entry.issueTeacher,
                    event: entry.event,
                    instructions: entry.instructions,
                };
            }
        }

        setMainPortalTable(next);
    };

    const fetchPublishScheduleData = async () => {
        setIsPublishLoading(true);
        try {
            const effectiveSchoolId = teacher?.schoolId || schoolId;
            if (!effectiveSchoolId || !selectedDate) {
                setMainPublishTable([]);
                return { success: false, error: "" };
            }

            const response = await getDailyScheduleAction(effectiveSchoolId, selectedDate, {
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

    const fetchPortalScheduleDate = async () => {
        if (!teacher || !selectedDate) return { success: false, error: "" };
        try {
            setIsPortalLoading(true);
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
                return true;
            }
            return false;
        } catch (error) {
            console.error("Error fetching teacher by ID:", error);
            return false;
        }
    };

    const handleSave = async (
        rowId: string,
        hour: number,
        instructions?: string,
        schoolId?: string,
        issueTeacherId?: string,
        subTeacherId?: string,
    ) => {
        try {
            setIsSaving(true);
            if (!selectedDate) return;

            const response = await (schoolId && issueTeacherId && subTeacherId
                ? (updateDailyInstructionAction as any)(
                      selectedDate,
                      rowId,
                      instructions,
                      hour,
                      schoolId,
                      issueTeacherId,
                      subTeacherId,
                  )
                : updateDailyInstructionAction(selectedDate, rowId, instructions));

            if (response.success) {
                const portalSchedule = { ...mainPortalTable };
                portalSchedule[selectedDate][`${hour}`].instructions = instructions;
                setMainPortalTable(portalSchedule);
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

    // Refresh the published dates options and selectedDate
    const refreshPublishDates = async (): Promise<{
        success: boolean;
        error: string;
        selected: string;
    }> => {
        if (!teacher) {
            setPublishDatesOptions([]);
            setSelectedDayId("");
            return { success: false, error: "", selected: "" };
        }

        setIsPortalLoading(true);
        try {
            const response = await getSchoolAction(teacher.schoolId);
            if (response.success && response.data) {
                const options = getPublishedDatesOptions(response.data.publishDates);
                setPublishDatesOptions(options);

                // Keep current if still valid; otherwise choose by time-based rule
                const keepCurrent = !!selectedDate && options.some((o) => o.value === selectedDate);
                const nextSelected = options.length
                    ? keepCurrent
                        ? selectedDate!
                        : (chooseDefaultDate(options) ??
                          selectSelectedDate(options)?.value ??
                          options[0].value)
                    : "";

                setSelectedDayId(nextSelected);
                return { success: true, error: "", selected: nextSelected };
            } else {
                setPublishDatesOptions([]);
                setSelectedDayId("");
                return { success: false, error: response.message || "", selected: "" };
            }
        } catch (err) {
            console.error("Error refreshing publish dates:", err);
            setPublishDatesOptions([]);
            setSelectedDayId("");
            return { success: false, error: "", selected: "" };
        } finally {
            setIsPortalLoading(false);
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
        refreshPublishDates,
    };

    return <PortalContext.Provider value={value}>{children}</PortalContext.Provider>;
};
