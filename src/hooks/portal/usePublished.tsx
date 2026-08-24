import { useEffect, useState } from "react";
import { getPublishedPortalDataAction } from "@/app/actions/GET/getPublishedPortalDataAction";
import { getCachedDailyScheduleAction } from "@/app/actions/GET/getCachedDailyScheduleAction";
import { DailySchedule, GetDailyScheduleResponse } from "@/models/types/dailySchedule";
import { ClassType } from "@/models/types/classes";
import { SubjectType } from "@/models/types/subjects";
import { TeacherType } from "@/models/types/teachers";
import { populateDailyScheduleTable } from "@/services/daily/populate";
import { errorToast } from "@/lib/toast";
import { logErrorAction } from "@/app/actions/POST/logErrorAction";
import messages from "@/resources/messages";
import { PortalType } from "@/models/types";

export const usePublished = (schoolId?: string, selectedDate?: string, teacher?: TeacherType) => {
    const [isPublishLoading, setIsPublishLoading] = useState<boolean>(false);
    const [mainPublishTable, setMainPublishTable] = useState<DailySchedule>({});
    const [hasFetched, setHasFetched] = useState<boolean>(false);

    // Entity lists for hydration
    const [allTeachers, setAllTeachers] = useState<TeacherType[] | undefined>(undefined);
    const [allSubjects, setAllSubjects] = useState<SubjectType[] | undefined>(undefined);
    const [allClasses, setAllClasses] = useState<ClassType[] | undefined>(undefined);
    const [fromHour, setFromHour] = useState<number>(1);
    const [toHour, setToHour] = useState<number>(10);
    const [listSchoolId, setListSchoolId] = useState<string | undefined>();

    const refreshEntities = async () => {
        if (!schoolId) return;
        try {
            // Fetch all in a single combined cached server action to prevent Connection Closed errors
            const res = await getPublishedPortalDataAction(schoolId, { portalType: PortalType.Teacher });

            if (res?.success && res.data) {
                const { teachers, subjects, classes, school } = res.data;
                if (teachers) setAllTeachers(teachers);
                if (subjects) setAllSubjects(subjects);
                if (classes) setAllClasses(classes);
                if (school) {
                    setFromHour(school.fromHour ?? 1);
                    setToHour(school.toHour ?? 10);
                }

                setListSchoolId(schoolId);

                return {
                    teachers,
                    subjects,
                    classes
                };
            }
        } catch (e) {
            logErrorAction({ description: `Error fetching public lists: ${e instanceof Error ? e.message : String(e)} ` });
        }
    };

    // Fetch lists when schoolId changes
    useEffect(() => {
        if (!schoolId) return;
        if (schoolId === listSchoolId) return; // Already have data for this school (hydrated or previously fetched)
        refreshEntities();
    }, [schoolId, listSchoolId]);

    const fetchPublishScheduleData = async (
        overrideSchoolId?: string,
        overrideDate?: string,
        overrideTeacher?: TeacherType,
        isBackground: boolean = false,
        overrideLists?: { teachers?: TeacherType[], subjects?: SubjectType[], classes?: ClassType[] }
    ): Promise<GetDailyScheduleResponse | null> => {
        const effectiveSchoolId = overrideSchoolId || schoolId;
        const effectiveTeacher = overrideTeacher || teacher;
        const effectiveDate = overrideDate || selectedDate;

        // Lior Debug
        console.log(`[Lior Debug Client] fetchPublishScheduleData called with: effectiveSchoolId=${effectiveSchoolId}, effectiveTeacher=${effectiveTeacher?.id} (${effectiveTeacher?.name}), effectiveDate=${effectiveDate}`);
        if (!effectiveSchoolId || !effectiveTeacher || !effectiveDate) {
            console.warn(`[Lior Debug Client] Missing required parameter: schoolId=${effectiveSchoolId}, teacher=${effectiveTeacher?.id}, date=${effectiveDate}`);
            void logErrorAction({
                schoolId: effectiveSchoolId,
                description: `[Lior Debug Client] fetchPublishScheduleData missing param: schoolId=${effectiveSchoolId}, teacherId=${effectiveTeacher?.id}, date=${effectiveDate}`,
                user: effectiveTeacher?.name
            });
            setMainPublishTable({});
            setHasFetched(true);
            return { success: true, data: null } as any;
        }

        try {
            if (!isBackground) setIsPublishLoading(true);

            // Use cached server action instead of direct DB query
            const response = await getCachedDailyScheduleAction(effectiveSchoolId, effectiveDate);

            // Lior Debug
            console.log(`[Lior Debug Client] getCachedDailyScheduleAction response:`, response);
            void logErrorAction({
                schoolId: effectiveSchoolId,
                description: `[Lior Debug Client] getCachedDailyScheduleAction returned success=${response?.success}, rowCount=${response?.data?.length}, message=${response?.message}`,
                user: effectiveTeacher?.name,
                metadata: { success: response?.success, message: response?.message, rowCount: response?.data?.length }
            });

            // Ensure entities are loaded before populating
            let currentTeachers = overrideLists?.teachers || allTeachers || [];
            let currentClasses = overrideLists?.classes || allClasses || [];
            let currentSubjects = overrideLists?.subjects || allSubjects || [];

            if ((currentTeachers.length === 0 || currentClasses.length === 0) && effectiveSchoolId) {
                const newLists = await refreshEntities();
                if (newLists) {
                    if (newLists.teachers) currentTeachers = newLists.teachers;
                    if (newLists.classes) currentClasses = newLists.classes;
                    if (newLists.subjects) currentSubjects = newLists.subjects;
                }
            }

            if (response?.success && response?.data && effectiveTeacher) {
                const newSchedule = await populateDailyScheduleTable(
                    mainPublishTable,
                    effectiveDate,
                    response.data,
                    fromHour,
                    toHour,
                    currentTeachers,
                    currentClasses,
                    currentSubjects
                );
                // Lior Debug
                const colCount = newSchedule ? Object.keys(newSchedule[effectiveDate] || {}).length : 0;
                console.log(`[Lior Debug Client] populateDailyScheduleTable created ${colCount} columns for date ${effectiveDate}`);
                void logErrorAction({
                    schoolId: effectiveSchoolId,
                    description: `[Lior Debug Client] populateDailyScheduleTable result: ${colCount} columns for date ${effectiveDate}`,
                    user: effectiveTeacher?.name
                });
                if (newSchedule) setMainPublishTable(newSchedule);
            } else {
                // Lior Debug
                console.warn(`[Lior Debug Client] Setting mainPublishTable to {} because response was not successful or data empty`);
                void logErrorAction({
                    schoolId: effectiveSchoolId,
                    description: `[Lior Debug Client] Setting mainPublishTable to {} (success=${response?.success}, hasData=${!!response?.data})`,
                    user: effectiveTeacher?.name
                });
                setMainPublishTable({});
                return response;
            }
            return response;
        } catch (error) {
            // Lior Debug
            console.error(`[Lior Debug Client] Error in fetchPublishScheduleData:`, error);
            logErrorAction({ description: `[Lior Debug Error] Error fetching daily schedule data(public): ${error instanceof Error ? error.message : String(error)} ` });
            return null;
        } finally {
            if (!isBackground) setIsPublishLoading(false);
            setHasFetched(true);
        }
    };

    const refreshDailyScheduleTeacherPortal = async (
        overrideSchoolId?: string,
        overrideDate?: string,
        overrideTeacher?: TeacherType,
        isBackground: boolean = false,
        overrideLists?: { teachers?: TeacherType[], subjects?: SubjectType[], classes?: ClassType[] }
    ) => {
        const response = await fetchPublishScheduleData(overrideSchoolId, overrideDate, overrideTeacher, isBackground, overrideLists);


        if (!response) {
            errorToast("בעיה בטעינת המידע, נסו שוב");
            return;
        }

        if (!response?.success) {
            if (response.message !== messages.dailySchedule.notPublished) {
                errorToast(response.message || "בעיה בטעינת המידע, נסו שוב");
            }
        }
    };

    const hydrateLists = (
        teachers: TeacherType[],
        subjects: SubjectType[],
        classes: ClassType[],
        hydratedSchoolId: string,
        newFromHour?: number,
        newToHour?: number
    ) => {
        setAllTeachers(teachers);
        setAllSubjects(subjects);
        setAllClasses(classes);
        setListSchoolId(hydratedSchoolId);
        if (newFromHour !== undefined) setFromHour(newFromHour);
        if (newToHour !== undefined) setToHour(newToHour);
    };

    return {
        mainPublishTable,
        isPublishLoading,
        fetchPublishScheduleData,
        refreshDailyScheduleTeacherPortal,
        hasFetched,
        hydrateLists,
        refreshEntities,
        teachers: allTeachers,
        subjects: allSubjects,
        classes: allClasses,
    };
};
