"use client";
import { logErrorAction } from "@/app/actions/POST/logErrorAction";
import React, { createContext, useContext, useState, ReactNode, useEffect, useRef } from "react";
import { getSchoolAction } from "@/app/actions/GET/getSchoolAction";
import { getTeacherByIdAction } from "@/app/actions/GET/getTeacherByIdAction";
import { SelectOption } from "@/models/types";
import { TeacherType } from "@/models/types/teachers";
import { SchoolSettingsType } from "@/models/types/settings";
import { chooseDefaultDate } from "@/utils/time";
import { getPublishedDatesOptions } from "@/resources/dayOptions";
import { getStorageTeacher } from "@/lib/localStorage";
import { DailySchedule, GetDailyScheduleResponse } from "@/models/types/dailySchedule";
import { SubjectType } from "@/models/types/subjects";
import { ClassType } from "@/models/types/classes";
import { usePublished } from "@/hooks/portal/usePublished";
import { ENTITIES_DATA_CHANGED } from "@/models/constant/sync";
import { SyncItem } from "@/services/sync/clientSyncService";

interface PortalContextType {
    teacher: TeacherType | undefined;
    schoolId: string | undefined;
    settings: SchoolSettingsType | undefined;
    selectedDate: string;
    isDatesLoading: boolean;
    handleDayChange: (value: string) => void;
    setTeacherAndSchool: (schoolId?: string, teacherId?: string) => Promise<boolean>;
    datesOptions: SelectOption[];
    handleRefreshDates: (refreshOptions?: { includeFutureAbsences?: boolean }) => Promise<{ success: boolean; error: string; selected: string; options: SelectOption[] }>;

    isPublishLoading: boolean;
    hasFetched: boolean;
    mainPublishTable: DailySchedule;
    fetchPublishScheduleData: (
        overrideSchoolId?: string,
        overrideDate?: string,
        overrideTeacher?: TeacherType,
        isBackground?: boolean,
        overrideLists?: { teachers?: TeacherType[], subjects?: SubjectType[], classes?: ClassType[] }
    ) => Promise<GetDailyScheduleResponse | null>;
    refreshDailyScheduleTeacherPortal: (
        overrideSchoolId?: string,
        overrideDate?: string,
        overrideTeacher?: TeacherType,
        isBackground?: boolean,
        overrideLists?: { teachers?: TeacherType[], subjects?: SubjectType[], classes?: ClassType[] }
    ) => Promise<void>;
    hydratePortalData: (
        teacher: TeacherType,
        schoolId: string,
        settings: SchoolSettingsType,
        datesOptions: SelectOption[],
        selectedDate: string,
        newTeachers?: TeacherType[],
        newSubjects?: SubjectType[],
        newClasses?: ClassType[],
        newHasUnpublishedFutureAbsences?: boolean
    ) => void;
    refreshEntities: () => Promise<{ teachers?: TeacherType[], subjects?: SubjectType[], classes?: ClassType[] } | undefined>;
    handleIncomingSync: (items?: SyncItem[]) => Promise<{ hasRelevantUpdate: boolean; newLists?: { teachers?: TeacherType[], subjects?: SubjectType[], classes?: ClassType[] } }>;
    hasUnpublishedFutureAbsences: boolean;
    setHasUnpublishedFutureAbsences: React.Dispatch<React.SetStateAction<boolean>>;
    teachers?: TeacherType[];
    subjects?: SubjectType[];
    classes?: ClassType[];
}

const PortalContext = createContext<PortalContextType | undefined>(undefined);

export const usePortalContext = () => {
    const context = useContext(PortalContext);
    if (context === undefined) {
        throw new Error("usePortal must be used within an PortalProvider");
    }
    return context;
};

export const useOptionalPortalContext = () => {
    return useContext(PortalContext);
};

type PortalProviderProps = {
    children: ReactNode;
};

export const PortalProvider: React.FC<PortalProviderProps> = ({ children }) => {
    const [teacher, setTeacher] = useState<TeacherType | undefined>();
    const [schoolId, setSchoolId] = useState<string | undefined>();
    const [settings, setSettings] = useState<SchoolSettingsType | undefined>();
    const [hasUnpublishedFutureAbsences, setHasUnpublishedFutureAbsences] = useState<boolean>(false);

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
    }, [schoolId, teacher]);

    const setTeacherAndSchool = async (schoolId?: string, teacherId?: string) => {
        try {
            if (!teacherId || !schoolId) return false;
            const response = await getTeacherByIdAction(teacherId);
            if (response?.success && response?.data) {
                setTeacher(response.data);
                setSchoolId(schoolId);
                return true;
            }
            return false;
        } catch (error) {
            logErrorAction({ description: `Error fetching teacher by ID: ${error instanceof Error ? error.message : String(error)}`, metadata: { teacherId } });
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
            if (!blockRef.current) return;

            if (teacher) {
                setIsDatesLoading(true);
                try {
                    const response = await getSchoolAction(teacher.schoolId, { forceFresh: true });
                    if (response?.success && response?.data) {
                        const { displaySchedule2Susb, fromHour, toHour, displayAltSchedule } = response.data;
                        setSettings({
                            id: 0,
                            schoolId: response.data.id,
                            displaySchedule2Susb,
                            displayAltSchedule,
                            fromHour,
                            toHour,
                        });
                        const res = getPublishedDatesOptions(response.data.publishDates);
                        if (res.length === 0) {
                            setDatesOptions([]);
                            setSelectedDate(chooseDefaultDate());
                            return;
                        }
                        setDatesOptions(res);
                        const timeBased = chooseDefaultDate();
                        const hasTimeBased = res.some((d: SelectOption) => d.value === timeBased);
                        handleDayChange(hasTimeBased ? timeBased : res[0].value);
                        blockRef.current = false;
                    }
                } catch (error) {
                    // if error persist we might need to reconsider a fix. if not just remove the error for "Failed to fetch"
                    logErrorAction({ description: `Error fetching publish dates (Keep Monitor): ${error instanceof Error ? error.message : String(error)}`, schoolId: teacher.schoolId, user: teacher.name });
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
        if (blockRef.current) fetchPublishedDates();
    }, [teacher]);

    // Initialize selectedDate when datesOptions becomes available
    useEffect(() => {
        if (datesOptions.length > 0 && (!selectedDate || !datesOptions.some(o => o.value === selectedDate))) {
            const timeBased = chooseDefaultDate();
            const hasTimeBased = datesOptions.some(d => d.value === timeBased);
            const initialDate = hasTimeBased ? timeBased : datesOptions[0].value;
            setSelectedDate(initialDate);
        }
    }, [datesOptions, selectedDate]);

    const handleRefreshDates = async (refreshOptions?: { includeFutureAbsences?: boolean }): Promise<{
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

        // Only show loader if we don't have options yet (background refresh otherwise text which is typed write now will be lost)
        if (datesOptions.length === 0) {
            setIsDatesLoading(true);
        }
        try {
            const { getTeacherPortalDataAction } = await import("@/app/actions/GET/getTeacherPortalDataAction");
            const data = await getTeacherPortalDataAction(teacher.schoolId, teacher.id, {
                includeFutureAbsences: refreshOptions?.includeFutureAbsences ?? hasUnpublishedFutureAbsences
            });

            if (data?.success && data?.datesOptions) {
                if (data.settings) setSettings(data.settings);
                if (typeof data.hasUnpublishedFutureAbsences === "boolean") {
                    setHasUnpublishedFutureAbsences(data.hasUnpublishedFutureAbsences);
                }
                const options = data.datesOptions;
                setDatesOptions(options);

                // Priority: Keep current selected date if it's still in the options!
                const keepCurrent = Boolean(selectedDate && options.some((o) => o.value === selectedDate));
                const nextSelected = keepCurrent
                    ? selectedDate
                    : (chooseDefaultDate(options) ?? (options.length > 0 ? options[0].value : chooseDefaultDate()));

                setSelectedDate(nextSelected);
                return { success: true, error: "", selected: nextSelected, options };
            } else {
                setDatesOptions([]);
                setSelectedDate(chooseDefaultDate());
                return { success: false, error: data?.message || "", selected: "", options: [] };
            }
        } catch (err) {
            // if error persist we might need to reconsider a fix. if not just remove the error for "Failed to fetch"
            logErrorAction({ description: `Error refreshing publish dates (Keep Monitor): ${err instanceof Error ? err.message : String(err)}`, schoolId: teacher.schoolId, user: teacher.name });
            setDatesOptions([]);
            setSelectedDate("");
            return { success: false, error: "", selected: "", options: [] };
        } finally {
            setIsDatesLoading(false);
        }
    };

    const isValidPublishDate = datesOptions.some((d) => d.value === selectedDate);
    const dateToFetch = isValidPublishDate ? selectedDate : "";

    const { fetchPublishScheduleData, refreshDailyScheduleTeacherPortal, mainPublishTable, isPublishLoading, hasFetched, hydrateLists, refreshEntities, teachers: portalTeachers, subjects: portalSubjects, classes: portalClasses } =
        usePublished(schoolId, dateToFetch, teacher);

    const hydratePortalData = (
        newTeacher: TeacherType,
        newSchoolId: string,
        newSettings: SchoolSettingsType,
        newDatesOptions: SelectOption[],
        newSelectedDate: string,
        newTeachers: TeacherType[] = [],
        newSubjects: SubjectType[] = [],
        newClasses: ClassType[] = [],
        newHasUnpublishedFutureAbsences: boolean = false
    ) => {
        // Update all states silently or explicitly
        setTeacher(newTeacher);
        setSchoolId(newSchoolId);
        setSettings(newSettings);
        setDatesOptions(newDatesOptions);
        setSelectedDate(newSelectedDate);
        setHasUnpublishedFutureAbsences(newHasUnpublishedFutureAbsences);

        // Hydrate lists in usePublished
        hydrateLists(newTeachers, newSubjects, newClasses, newSchoolId, newSettings?.fromHour, newSettings?.toHour);

        // Prevent the effect from re-fetching dates
        blockRef.current = false;
    };

    const handleIncomingSync = async (items?: SyncItem[]) => {
        // Fix: Explicitly check for undefined/null to detect manual refresh. 
        // An empty array [] means "checked for updates but found none", so it is NOT manual.
        const isManual = items === undefined || items === null;
        let hasRelevantUpdate = isManual;
        let hasEntitiesUpdate = false;

        if (!isManual && items) {
            items.forEach(item => {
                if (!item.payload) return;
                const schoolMatches = !item.payload.schoolId || !teacher?.schoolId || item.payload.schoolId === teacher.schoolId;

                if (schoolMatches) {
                    if (item.channel === ENTITIES_DATA_CHANGED) {
                        hasEntitiesUpdate = true;
                    } else {
                        const dateMatches = !item.payload.date || !selectedDate || item.payload.date === selectedDate;
                        if (dateMatches) {
                            hasRelevantUpdate = true;
                        }
                    }
                }
            });
        }

        if (hasEntitiesUpdate) {
            const newLists = await refreshEntities();
            return { hasRelevantUpdate, newLists };
        }

        return { hasRelevantUpdate };
    };

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
        refreshDailyScheduleTeacherPortal,
        fetchPublishScheduleData,
        hydratePortalData,
        refreshEntities,
        handleIncomingSync,
        hasUnpublishedFutureAbsences,
        setHasUnpublishedFutureAbsences,
        teachers: portalTeachers,
        subjects: portalSubjects,
        classes: portalClasses,
    };

    return <PortalContext.Provider value={value}>{children}</PortalContext.Provider>;
};
