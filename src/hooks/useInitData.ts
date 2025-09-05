"use client";

import { GetSchoolResponse, SchoolType } from "@/models/types/school";
import { GetSubjectsResponse, SubjectType } from "@/models/types/subjects";
import { GetTeachersResponse, TeacherType } from "@/models/types/teachers";
import { useSession } from "next-auth/react";
import { ClassType, GetClassesResponse } from "@/models/types/classes";
import { useEffect } from "react";
import {
    getCacheTimestamp,
    getStorageClasses,
    getStorageSchool,
    getStorageSchoolId,
    getStorageSubjects,
    getStorageTeachers,
    setCacheTimestamp,
    setStorageClasses,
    setStorageSchool,
    setStorageSchoolId,
    setStorageSubjects,
    setStorageTeachers,
} from "@/lib/localStorage";
import { getSchoolAction as getSchoolFromDB } from "@/app/actions/GET/getSchoolAction";
import { getTeachersAction as getTeachersFromDB } from "@/app/actions/GET/getTeachersAction";
import { getSubjectsAction as getSubjectsFromDB } from "@/app/actions/GET/getSubjectsAction";
import { getClassesAction as getClassesFromDB } from "@/app/actions/GET/getClassesAction";
import { isCacheFresh } from "@/utils/time";
import { STATUS_AUTH } from "@/models/constant/session";

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

    // Promise that checks if data is in cache, if not, fetches from DB
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
                let schoolPromise, classesPromise, teachersPromise, subjectsPromise, annualPromise;

                if (!school) {
                    schoolPromise = promiseFromCacheOrDB<SchoolType, GetSchoolResponse>(
                        schoolId,
                        getStorageSchool(),
                        getSchoolFromDB,
                    );
                }

                if (!classes) {
                    classesPromise = promiseFromCacheOrDB<ClassType[], GetClassesResponse>(
                        schoolId,
                        getStorageClasses(),
                        getClassesFromDB,
                    );
                }

                if (!teachers) {
                    teachersPromise = promiseFromCacheOrDB<TeacherType[], GetTeachersResponse>(
                        schoolId,
                        getStorageTeachers(),
                        getTeachersFromDB,
                    );
                }

                if (!subjects) {
                    subjectsPromise = promiseFromCacheOrDB<SubjectType[], GetSubjectsResponse>(
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
                    setStorageSchool(schoolRes.data);
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

                // Update cache timestamp if any data was fetched
                if (schoolPromise || classesPromise || teachersPromise || subjectsPromise) {
                    setCacheTimestamp(Date.now().toString());
                }
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };

        if (status === STATUS_AUTH && typeof window !== "undefined" && session?.user?.schoolId) {
            // Initialize school ID from user session if available
            const storedSchoolId = getStorageSchoolId();
            if (!storedSchoolId) setStorageSchoolId(session.user.schoolId);
            fetchData(session.user.schoolId);
        }
    }, [session, status, school, teachers, subjects, classes]);
};

export default useInitData;
