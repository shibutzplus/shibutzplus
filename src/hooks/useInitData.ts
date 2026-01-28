"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { STATUS_AUTH } from "@/models/constant/session";
import { SchoolType } from "@/models/types/school";
import { SubjectType } from "@/models/types/subjects";
import { TeacherType } from "@/models/types/teachers";
import { ClassType } from "@/models/types/classes";
import { checkForUpdates } from "@/services/syncService";
import { compareHebrew, sortByName } from "@/utils/sort";
import { ENTITIES_DATA_CHANGED, POLL_INTERVAL_MS } from "@/models/constant/sync";
import { useSearchParams } from "next/navigation";

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
 * Initialize app data.
 * Fetches data from DB only if changes are detected (Smart Polling).
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
    const searchParams = useSearchParams();

    // Determine effective school ID
    const userRole = (session?.user as any)?.role;
    const picked = searchParams.get("schoolId");

    const effectiveSchoolId = status === STATUS_AUTH && session?.user?.schoolId
        ? (userRole === "admin" && picked?.trim() ? picked.trim() : session.user.schoolId)
        : null;

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

                // If no updates and we already have data for the current school, skip
                // BUT only if effectiveSchoolId matches the current school
                const schoolsMatch = school?.id === effectiveSchoolId;
                const shouldFetch = hasUpdates || !schoolsMatch || !school || !teachers || !subjects || !classes;

                if (!shouldFetch) {
                    return;
                }

                if (typeof window !== "undefined" && latestTs > 0) {
                    localStorage.setItem(SYNC_TS_KEY, String(latestTs));
                }

                const { getInitialDataAction } = await import("@/app/actions/GET/getInitialDataAction");
                const { school: fetchedSchool, teachers: fetchedTeachers, subjects: fetchedSubjects, classes: fetchedClasses } = await getInitialDataAction(effectiveSchoolId);

                if (fetchedSchool.success && fetchedSchool.data) {
                    setSchool(fetchedSchool.data);
                }

                if (fetchedTeachers.success && fetchedTeachers.data) {
                    const sorted = [...fetchedTeachers.data].sort(sortByName);
                    setTeachers(sorted);
                }

                if (fetchedSubjects.success && fetchedSubjects.data) {
                    const sorted = [...fetchedSubjects.data].sort(sortByName);
                    setSubjects(sorted);
                }

                if (fetchedClasses.success && fetchedClasses.data) {
                    const sorted = [...fetchedClasses.data].sort((a, b) => {
                        if (a.activity !== b.activity) return a.activity ? 1 : -1;
                        return compareHebrew(a.name, b.name);
                    });
                    setClasses(sorted);
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

    }, [effectiveSchoolId, school, teachers, subjects, classes]);

};

export default useInitData;
