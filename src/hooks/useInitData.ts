"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { STATUS_AUTH } from "@/models/constant/session";
import { SchoolType, GetSchoolResponse } from "@/models/types/school";
import { GetSubjectsResponse, SubjectType } from "@/models/types/subjects";
import { GetTeachersResponse, TeacherType } from "@/models/types/teachers";
import { ClassType, GetClassesResponse } from "@/models/types/classes";
import { getSchoolAction as getSchoolFromDB } from "@/app/actions/GET/getSchoolAction";
import { getTeachersAction as getTeachersFromDB } from "@/app/actions/GET/getTeachersAction";
import { getSubjectsAction as getSubjectsFromDB } from "@/app/actions/GET/getSubjectsAction";
import { getClassesAction as getClassesFromDB } from "@/app/actions/GET/getClassesAction";
import { getCacheTimestamp, getStorageClasses, getStorageSubjects, getStorageTeachers, setCacheTimestamp, setStorageClasses, setStorageSubjects, setStorageTeachers, } from "@/lib/localStorage";
import { isCacheFresh } from "@/utils/time";
import { checkForUpdates } from "@/services/syncService";
import { compareHebrew, sortByName } from "@/utils/sort";
import { ENTITIES_DATA_CHANGED, POLL_INTERVAL_MS } from "@/models/constant/sync";

interface useInitDataProps {
    school: SchoolType | undefined;
    setSchool: (school: SchoolType | undefined) => void;

    teachers: TeacherType[] | undefined;
    setTeachers: (teachers: TeacherType[] | undefined) => void;
    subjects: SubjectType[] | undefined;
    setSubjects: (subjects: SubjectType[] | undefined) => void;
    classes: ClassType[] | undefined;
    setClasses: (classes: ClassType[] | undefined) => void;
}

const SYNC_TS_KEY = "sync_ts_lists";

/**
 * Initialize data for the app
 * Checks local storage for data, if not found, fetches from server
 */
const useInitData = ({
    school,
    setSchool,
    teachers,
    setTeachers,
    subjects,
    setSubjects,
    classes,
    setClasses,
}: useInitDataProps) => {
    const { data: session, status } = useSession();

    // Determine effective school ID
    const userRole = (session?.user as any)?.role;
    let picked: string | null = null;
    if (typeof window !== "undefined") {
        try {
            picked = new URLSearchParams(window.location.search).get("schoolId");
        } catch {
            picked = null;
        }
    }

    const effectiveSchoolId = status === STATUS_AUTH && session?.user?.schoolId
        ? (userRole === "admin" && picked?.trim() ? picked.trim() : session.user.schoolId)
        : null;

    // Promise that checks if data is in cache, if not, fetches from DB. School data is always fetched from DB.
    const promiseFromCacheOrDB = <T, R>(
        schoolId: string,
        storage: T | null,
        getFromDB: (id: string) => Promise<R>,
    ) => {
        return storage && isCacheFresh(getCacheTimestamp())
            ? Promise.resolve({ success: true, message: "", data: storage })
            : getFromDB(schoolId);
    };

    useEffect(() => {
        if (!effectiveSchoolId) return;

        const fetchData = async () => {

            try {
                // Check for updates
                const lastSeen = Number(
                    (typeof window !== "undefined" && localStorage.getItem(SYNC_TS_KEY)) || 0,
                );

                const { hasUpdates, latestTs } = await checkForUpdates({
                    since: lastSeen,
                    channels: [ENTITIES_DATA_CHANGED],
                });

                let changed = false;
                if (hasUpdates) {
                    changed = true;
                    if (typeof window !== "undefined") {
                        localStorage.setItem(SYNC_TS_KEY, String(latestTs));
                    }

                }

                // If no updates and we already have data, skip
                if (!changed && school && teachers && subjects && classes) {

                    return;
                }

                let schoolPromise: Promise<GetSchoolResponse> | undefined;
                let classesPromise: Promise<GetClassesResponse> | undefined;
                let teachersPromise: Promise<GetTeachersResponse> | undefined;
                let subjectsPromise: Promise<GetSubjectsResponse> | undefined;

                // Always fetch school if missing or if changed
                if (!school) {
                    schoolPromise = getSchoolFromDB(effectiveSchoolId);
                }

                if (changed || !classes) {
                    classesPromise = changed
                        ? getClassesFromDB(effectiveSchoolId)
                        : promiseFromCacheOrDB<ClassType[], GetClassesResponse>(
                            effectiveSchoolId,
                            getStorageClasses(),
                            getClassesFromDB,
                        );
                }

                if (changed || !teachers) {
                    teachersPromise = changed
                        ? getTeachersFromDB(effectiveSchoolId)
                        : promiseFromCacheOrDB<TeacherType[], GetTeachersResponse>(
                            effectiveSchoolId,
                            getStorageTeachers(),
                            getTeachersFromDB,
                        );
                }

                if (changed || !subjects) {
                    subjectsPromise = changed
                        ? getSubjectsFromDB(effectiveSchoolId)
                        : promiseFromCacheOrDB<SubjectType[], GetSubjectsResponse>(
                            effectiveSchoolId,
                            getStorageSubjects(),
                            getSubjectsFromDB,
                        );
                }

                const [schoolRes, classesRes, teachersRes, subjectsRes] = await Promise.all([
                    schoolPromise || Promise.resolve(null),
                    classesPromise || Promise.resolve(null),
                    teachersPromise || Promise.resolve(null),
                    subjectsPromise || Promise.resolve(null),
                ]);

                if (schoolRes && schoolRes.success && schoolRes.data) {
                    setSchool(schoolRes.data);
                }

                if (teachersRes && teachersRes.success && teachersRes.data) {
                    const sortedTeachers = [...teachersRes.data].sort(sortByName);
                    setTeachers(sortedTeachers);
                    setStorageTeachers(sortedTeachers);
                }
                if (subjectsRes && subjectsRes.success && subjectsRes.data) {
                    const sortedSubjects = [...subjectsRes.data].sort(sortByName);
                    setSubjects(sortedSubjects);
                    setStorageSubjects(sortedSubjects);
                }
                if (classesRes && classesRes.success && classesRes.data) {
                    const sortedClasses = [...classesRes.data].sort((a, b) => {
                        if (a.activity !== b.activity) return a.activity ? 1 : -1;
                        return compareHebrew(a.name, b.name);
                    });
                    setClasses(sortedClasses);
                    setStorageClasses(sortedClasses);
                }

                // Update cache timestamp only when real change detected (and data was fetched)
                if (changed) {
                    setCacheTimestamp(Date.now().toString());
                }
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };

        // Initial fetch
        fetchData();

        // Setup polling
        const intervalId = setInterval(() => {
            // Only poll if tab is visible
            if (!document.hidden) {
                fetchData();
            }
        }, POLL_INTERVAL_MS);

        return () => clearInterval(intervalId);

    }, [effectiveSchoolId, school, teachers, subjects, classes]); // Re-run if dependencies change, but mainly just effectiveSchoolId determines the start

};

export default useInitData;
