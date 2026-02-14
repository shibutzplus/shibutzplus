import { useEffect, useState } from "react";
import { getCachedClassesAction } from "@/app/actions/GET/getCachedClassesAction";
import { getCachedSubjectsAction } from "@/app/actions/GET/getCachedSubjectsAction";
import { getCachedTeachersAction } from "@/app/actions/GET/getCachedTeachersAction";
import { getSchoolAction } from "@/app/actions/GET/getSchoolAction";
import { getCachedDailyScheduleAction } from "@/app/actions/GET/getCachedDailyScheduleAction";
import { DailySchedule, GetDailyScheduleResponse } from "@/models/types/dailySchedule";
import { ClassType } from "@/models/types/classes";
import { SubjectType } from "@/models/types/subjects";
import { TeacherType } from "@/models/types/teachers";
import { populateDailyScheduleTable } from "@/services/daily/populate";
import { errorToast } from "@/lib/toast";
import { logErrorAction } from "@/app/actions/POST/logErrorAction";
import messages from "@/resources/messages";

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
            // Use cached versions instead of direct DB queries
            const [teachersRes, subjectsRes, classesRes, schoolRes] = await Promise.all([
                getCachedTeachersAction(schoolId, { isPrivate: false, hasSub: true }),
                getCachedSubjectsAction(schoolId, { isPrivate: false }),
                getCachedClassesAction(schoolId, { isPrivate: false }),
                getSchoolAction(schoolId) // Public school info
            ]);

            if (teachersRes.success && teachersRes.data) setAllTeachers(teachersRes.data);
            if (subjectsRes.success && subjectsRes.data) setAllSubjects(subjectsRes.data);
            if (classesRes.success && classesRes.data) setAllClasses(classesRes.data);
            if (schoolRes.success && schoolRes.data) {
                setFromHour(schoolRes.data.fromHour ?? 1);
                setToHour(schoolRes.data.toHour ?? 10);
            }

            setListSchoolId(schoolId);

            return {
                teachers: teachersRes.data,
                subjects: subjectsRes.data,
                classes: classesRes.data
            };

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

        if (!effectiveSchoolId || !effectiveTeacher || !effectiveDate) {
            setMainPublishTable({});
            setHasFetched(true);
            return { success: true, data: null } as any;
        }

        try {
            if (!isBackground) setIsPublishLoading(true);

            // Use cached server action instead of direct DB query
            const response = await getCachedDailyScheduleAction(effectiveSchoolId, effectiveDate);

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

            if (response?.success && response.data && effectiveTeacher) {
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
                if (newSchedule) setMainPublishTable(newSchedule);
            } else {
                setMainPublishTable({});
                return response;
            }
            return response;
        } catch (error) {
            logErrorAction({ description: `Error fetching daily schedule data(public): ${error instanceof Error ? error.message : String(error)} ` });
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

        if (!response.success) {
            if (response.message !== messages.dailySchedule.notPublished) {
                errorToast(response.message || "בעיה בטעינת המידע, נסו שוב");
            }
        }
    };

    const hydrateLists = (
        teachers: TeacherType[],
        subjects: SubjectType[],
        classes: ClassType[],
        hydratedSchoolId: string
    ) => {
        setAllTeachers(teachers);
        setAllSubjects(subjects);
        setAllClasses(classes);
        setListSchoolId(hydratedSchoolId);
    };

    return {
        mainPublishTable,
        isPublishLoading,
        fetchPublishScheduleData,
        refreshDailyScheduleTeacherPortal,
        hasFetched,
        hydrateLists,
        refreshEntities
    };
};
