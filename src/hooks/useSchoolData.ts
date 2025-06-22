"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { SchoolType } from "@/models/types/school";
import { TeacherType } from "@/models/types/teachers";
import { ClassType } from "@/models/types/classes";
import { SubjectType } from "@/models/types/subjects";
import { getSchoolAction } from "@/app/actions/getSchoolAction";
import { getTeachersAction } from "@/app/actions/getTeachersAction";
import { getSubjectsAction } from "@/app/actions/getSubjectsAction";
import { getClassesAction } from "@/app/actions/getClassesAction";
import { safeParseJSON } from "@/utils/format";
import { STORAGE_KEYS } from "@/resources/storage";

interface UseSchoolDataProps {
    setSchool: (school: SchoolType | undefined) => void;
    setTeachers: (teachers: TeacherType[] | undefined) => void;
    setSubjects: (subjects: SubjectType[] | undefined) => void;
    setClasses: (classes: ClassType[] | undefined) => void;
}

export function useSchoolData({
    setSchool,
    setTeachers,
    setSubjects,
    setClasses,
}: UseSchoolDataProps) {
    const { data: session, status } = useSession();
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (status === "authenticated" && session?.user) {
            const fetchData = async () => {
                try {
                    setIsLoading(true);
                    setError(null);

                    // Get school ID from localStorage or session
                    const schoolId =
                        typeof window !== "undefined"
                            ? localStorage.getItem(STORAGE_KEYS.SCHOOL_ID) || session.user.schoolId
                            : session.user.schoolId;

                    if (!schoolId) {
                        setError("No school ID found");
                        setIsLoading(false);
                        return;
                    }

                    // Check if cache is fresh (less than 1 hour old)
                    const cacheTimestamp = localStorage.getItem(STORAGE_KEYS.CACHE_TIMESTAMP);
                    const isCacheFresh =
                        cacheTimestamp && Date.now() - parseInt(cacheTimestamp) < 3600000; // 1 hour

                    // Try to load data from localStorage first (for immediate UI rendering)
                    const cachedSchool = safeParseJSON<SchoolType>(
                        localStorage.getItem(STORAGE_KEYS.SCHOOL_DATA),
                    );
                    const cachedTeachers = safeParseJSON<TeacherType[]>(
                        localStorage.getItem(STORAGE_KEYS.TEACHERS_DATA),
                    );
                    const cachedSubjects = safeParseJSON<SubjectType[]>(
                        localStorage.getItem(STORAGE_KEYS.SUBJECTS_DATA),
                    );
                    const cachedClasses = safeParseJSON<ClassType[]>(
                        localStorage.getItem(STORAGE_KEYS.CLASSES_DATA),
                    );

                    // Set cached data if available for immediate UI rendering
                    if (cachedSchool) setSchool(cachedSchool);
                    if (cachedTeachers) setTeachers(cachedTeachers);
                    if (cachedSubjects) setSubjects(cachedSubjects);
                    if (cachedClasses) setClasses(cachedClasses);

                    // Determine which data needs to be fetched based on cache availability and freshness
                    const needFetchSchool = !cachedSchool || !isCacheFresh;
                    const needFetchTeachers = !cachedTeachers || !isCacheFresh;
                    const needFetchSubjects = !cachedSubjects || !isCacheFresh;
                    const needFetchClasses = !cachedClasses || !isCacheFresh;

                    // Prepare fetch promises only for data that needs to be fetched
                    const schoolPromise = needFetchSchool
                        ? getSchoolAction(schoolId)
                        : Promise.resolve({ success: true, message: "", data: cachedSchool });
                    
                    const teachersPromise = needFetchTeachers
                        ? getTeachersAction(schoolId)
                        : Promise.resolve({ success: true, message: "", data: cachedTeachers });
                    
                    const subjectsPromise = needFetchSubjects
                        ? getSubjectsAction(schoolId)
                        : Promise.resolve({ success: true, message: "", data: cachedSubjects });
                    
                    const classesPromise = needFetchClasses
                        ? getClassesAction(schoolId)
                        : Promise.resolve({ success: true, message: "", data: cachedClasses });


                    // Execute fetch promises
                    const [schoolResponse, teachersResponse, subjectsResponse, classesResponse] =
                        await Promise.all([schoolPromise, teachersPromise, subjectsPromise, classesPromise]);

                    // Process school data
                    if (schoolResponse.success && schoolResponse.data) {
                        setSchool(schoolResponse.data);
                        if (needFetchSchool) {
                            localStorage.setItem(
                                STORAGE_KEYS.SCHOOL_DATA,
                                JSON.stringify(schoolResponse.data),
                            );
                        }
                    } else if (!cachedSchool) {
                        console.error("Failed to fetch school data:", schoolResponse.message);
                    }

                    // Process teachers data
                    if (teachersResponse.success && teachersResponse.data) {
                        setTeachers(teachersResponse.data);
                        if (needFetchTeachers) {
                            localStorage.setItem(
                                STORAGE_KEYS.TEACHERS_DATA,
                                JSON.stringify(teachersResponse.data),
                            );
                        }
                    } else if (!cachedTeachers) {
                        console.error("Failed to fetch teachers data:", teachersResponse.message);
                    }

                    // Process subjects data
                    if (subjectsResponse.success && subjectsResponse.data) {
                        setSubjects(subjectsResponse.data);
                        if (needFetchSubjects) {
                            localStorage.setItem(
                                STORAGE_KEYS.SUBJECTS_DATA,
                                JSON.stringify(subjectsResponse.data),
                            );
                        }
                    } else if (!cachedSubjects) {
                        console.error("Failed to fetch subjects data:", subjectsResponse.message);
                    }

                    // Process classes data
                    if (classesResponse.success && classesResponse.data) {
                        setClasses(classesResponse.data);
                        if (needFetchClasses) {
                            localStorage.setItem(
                                STORAGE_KEYS.CLASSES_DATA,
                                JSON.stringify(classesResponse.data),
                            );
                        }
                    } else if (!cachedClasses) {
                        console.error("Failed to fetch classes data:", classesResponse.message);
                    }

                    // Update cache timestamp if any data was fetched
                    if (needFetchSchool || needFetchTeachers || needFetchSubjects || needFetchClasses) {
                        localStorage.setItem(STORAGE_KEYS.CACHE_TIMESTAMP, Date.now().toString());
                    }
                } catch (err) {
                    console.error("Error fetching school data:", err);
                    setError("Failed to load school data. Please try again later.");
                } finally {
                    setIsLoading(false);
                }
            };

            fetchData();
        }
    }, [session, status, setSchool, setTeachers, setSubjects, setClasses]);

    return { isLoading, error };
}
