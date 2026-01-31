import { useEffect, useState } from "react";
import { getDailyScheduleAction } from "@/app/actions/GET/getDailyScheduleAction";
import { getClassesAction } from "@/app/actions/GET/getClassesAction";
import { getSubjectsAction } from "@/app/actions/GET/getSubjectsAction";
import { getTeachersAction } from "@/app/actions/GET/getTeachersAction";
import { getSchoolAction } from "@/app/actions/GET/getSchoolAction";
import { DailySchedule, GetDailyScheduleResponse } from "@/models/types/dailySchedule";
import { ClassType } from "@/models/types/classes";
import { SubjectType } from "@/models/types/subjects";
import { TeacherType } from "@/models/types/teachers";
import messages from "@/resources/messages";
import { populateDailyScheduleTable } from "@/services/daily/populate";
import { HOURS_IN_DAY } from "@/utils/time";
import { errorToast } from "@/lib/toast";
import { logErrorAction } from "@/app/actions/POST/logErrorAction";

export const usePublished = (schoolId?: string, selectedDate?: string, teacher?: TeacherType) => {
    const [isPublishLoading, setIsPublishLoading] = useState<boolean>(false);
    const [mainPublishTable, setMainPublishTable] = useState<DailySchedule>({});
    const [hasFetched, setHasFetched] = useState<boolean>(false);

    // Entity lists for hydration
    const [allTeachers, setAllTeachers] = useState<TeacherType[] | undefined>(undefined);
    const [allSubjects, setAllSubjects] = useState<SubjectType[] | undefined>(undefined);
    const [allClasses, setAllClasses] = useState<ClassType[] | undefined>(undefined);
    const [schoolHours, setSchoolHours] = useState<number>(HOURS_IN_DAY);
    const [listSchoolId, setListSchoolId] = useState<string | undefined>();

    // Fetch lists when schoolId changes
    useEffect(() => {
        if (!schoolId) return;
        if (schoolId === listSchoolId) return; // Already have data for this school (hydrated or previously fetched)

        const fetchLists = async () => {
            try {
                const [teachersRes, subjectsRes, classesRes, schoolRes] = await Promise.all([
                    getTeachersAction(schoolId, { isPrivate: false, hasSub: true }),
                    getSubjectsAction(schoolId, { isPrivate: false }),
                    getClassesAction(schoolId, { isPrivate: false }),
                    getSchoolAction(schoolId) // Public school info
                ]);

                if (teachersRes.success && teachersRes.data) setAllTeachers(teachersRes.data);
                if (subjectsRes.success && subjectsRes.data) setAllSubjects(subjectsRes.data);
                if (classesRes.success && classesRes.data) setAllClasses(classesRes.data);
                if (schoolRes.success && schoolRes.data) setSchoolHours(schoolRes.data.hoursNum || HOURS_IN_DAY);

                setListSchoolId(schoolId);

            } catch (e) {
                logErrorAction({ description: `Error fetching public lists: ${e instanceof Error ? e.message : String(e)}` });
            }
        };
        fetchLists();
    }, [schoolId, listSchoolId]);

    const fetchPublishScheduleData = async (
        overrideSchoolId?: string,
        overrideDate?: string,
        overrideTeacher?: TeacherType
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
            setIsPublishLoading(true);
            const response = await getDailyScheduleAction(effectiveSchoolId, effectiveDate, { isPrivate: false });
            if (response.success && response.data && effectiveTeacher) {
                const newSchedule = await populateDailyScheduleTable(
                    mainPublishTable,
                    effectiveDate,
                    response.data,
                    schoolHours,
                    allTeachers || [],
                    allClasses || [],
                    allSubjects || []
                );
                if (newSchedule) setMainPublishTable(newSchedule);
            } else {
                setMainPublishTable({});
                return response;
            }
            return response;
        } catch (error) {
            logErrorAction({ description: `Error fetching daily schedule data (public): ${error instanceof Error ? error.message : String(error)}` });
            return null;
        } finally {
            setIsPublishLoading(false);
            setHasFetched(true);
        }
    };

    const refreshDailyScheduleTeacherPortal = async (
        overrideSchoolId?: string,
        overrideDate?: string,
        overrideTeacher?: TeacherType
    ) => {
        const response = await fetchPublishScheduleData(overrideSchoolId, overrideDate, overrideTeacher);


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
        hydrateLists
    };
};
