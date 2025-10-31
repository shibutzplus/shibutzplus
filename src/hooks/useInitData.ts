"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { STATUS_AUTH } from "@/models/constant/session";
import { SchoolType } from "@/models/types/school";
import { GetSubjectsResponse, SubjectType } from "@/models/types/subjects";
import { GetTeachersResponse, TeacherType } from "@/models/types/teachers";
import { ClassType, GetClassesResponse } from "@/models/types/classes";
import { getSchoolAction as getSchoolFromDB } from "@/app/actions/GET/getSchoolAction";
import { getTeachersAction as getTeachersFromDB } from "@/app/actions/GET/getTeachersAction";
import { getSubjectsAction as getSubjectsFromDB } from "@/app/actions/GET/getSubjectsAction";
import { getClassesAction as getClassesFromDB } from "@/app/actions/GET/getClassesAction";
import {
    getCacheTimestamp, getStorageClasses, getStorageSubjects, getStorageTeachers,
    setCacheTimestamp, setStorageClasses, setStorageSubjects, setStorageTeachers,
} from "@/lib/localStorage";
import { isCacheFresh } from "@/utils/time";

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

const POWER_USER_EMAIL = process.env.NEXT_PUBLIC_POWER_USER_EMAIL;
const SYNC_TS_KEY = "sync_ts_detailsUpdate";

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
        const fetchData = async (schoolId: string) => {
            try {
                let schoolPromise, classesPromise, teachersPromise, subjectsPromise;

                if (!school) {
                    // fetch school from DB
                    schoolPromise = getSchoolFromDB(schoolId);
                }

                // single poll for any data change across entities
                const lastSeen = Number((typeof window !== "undefined" && localStorage.getItem(SYNC_TS_KEY)) || 0);
                const since = Math.max(0, lastSeen - 1);
                let changed = false;
                try {
                    const res = await fetch(`/api/sync/poll?since=${since}&channels=detailsUpdate`, { cache: "no-store" });
                    if (res.ok) {
                        const data = await res.json();
                        const latest = Number(data?.latestTs || 0);
                        changed = latest > lastSeen;
                        if (changed && typeof window !== "undefined") {
                            localStorage.setItem(SYNC_TS_KEY, String(latest));
                        }
                    }
                } catch {
                    // ignore polling errors, fall back to cache logic below
                }

                if (!classes) {
                    classesPromise = changed
                        ? getClassesFromDB(schoolId)
                        : promiseFromCacheOrDB<ClassType[], GetClassesResponse>(
                            schoolId,
                            getStorageClasses(),
                            getClassesFromDB,
                        );
                }

                if (!teachers) {
                    teachersPromise = changed
                        ? getTeachersFromDB(schoolId)
                        : promiseFromCacheOrDB<TeacherType[], GetTeachersResponse>(
                            schoolId,
                            getStorageTeachers(),
                            getTeachersFromDB,
                        );
                }

                if (!subjects) {
                    subjectsPromise = changed
                        ? getSubjectsFromDB(schoolId)
                        : promiseFromCacheOrDB<SubjectType[], GetSubjectsResponse>(
                            schoolId,
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
                    setTeachers(teachersRes.data);
                    setStorageTeachers(teachersRes.data);
                }
                if (subjectsRes && subjectsRes.success && subjectsRes.data) {
                    setSubjects(subjectsRes.data);
                    setStorageSubjects(subjectsRes.data);
                }
                if (classesRes && classesRes.success && classesRes.data) {
                    setClasses(classesRes.data);
                    setStorageClasses(classesRes.data);
                }

                // Update cache timestamp only when real change detected
                if (changed) {
                    setCacheTimestamp(Date.now().toString());
                }
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };

        if (status === STATUS_AUTH && typeof window !== "undefined" && session?.user?.schoolId) {
            // prefer ?schoolId for Power User
            const email = (session.user as any)?.email as string | undefined;
            let picked: string | null = null;
            try {
                picked = new URLSearchParams(window.location.search).get("schoolId");
            } catch {
                picked = null;
            }
            const effectiveSchoolId = email === POWER_USER_EMAIL && picked?.trim() ? picked.trim() : session.user.schoolId;

            fetchData(effectiveSchoolId);
        }
    }, [session, status, school, teachers, subjects, classes]);
};

export default useInitData;
