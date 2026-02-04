"use client";

import React, { useEffect } from "react";
import { useSession } from "next-auth/react";
import { STATUS_AUTH } from "@/models/constant/session";
import { USER_ROLES } from "@/models/constant/auth";
import { SchoolType } from "@/models/types/school";
import { SubjectType } from "@/models/types/subjects";
import { TeacherType } from "@/models/types/teachers";
import { ClassType } from "@/models/types/classes";
import { compareHebrew, sortByName } from "@/utils/sort";
import { useSearchParams } from "next/navigation";
import { logErrorAction } from "@/app/actions/POST/logErrorAction";
import { usePopup } from "@/context/PopupContext";
import MsgPopup from "@/components/popups/MsgPopup/MsgPopup";

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
 * Initialize app data from DB
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
    const { openPopup } = usePopup();

    // Determine effective school ID
    const userRole = (session?.user as any)?.role;
    const picked = searchParams.get("schoolId");

    const effectiveSchoolId = status === STATUS_AUTH && session?.user?.schoolId
        ? (userRole === USER_ROLES.ADMIN && picked?.trim() ? picked.trim() : session.user.schoolId)
        : null;

    useEffect(() => {
        if (!effectiveSchoolId) return;

        const fetchData = async () => {
            try {
                // If data is already present for the current school, do nothing
                const schoolsMatch = school?.id === effectiveSchoolId;
                const matches = schoolsMatch && teachers && subjects && classes;

                if (matches) {
                    return;
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
                const message = error instanceof Error ? error.message : String(error);

                // Ignore "Load failed" (dynamic import) and "Failed to fetch" (network) errors
                if (message === "Load failed" || message === "Failed to fetch") {
                    openPopup(
                        "msgPopup", "S",
                        React.createElement(MsgPopup, {
                            message: "בעיה רגעית בהתחברות. אנא בצעו רענון קצר כדי להמשיך.",
                            okText: "ריענון",
                            onOk: () => window.location.reload()
                        })
                    );
                    return;
                }

                logErrorAction({
                    description: `Error fetching initial data: ${message}`,
                    schoolId: effectiveSchoolId || undefined
                });
            }
        };

        // Initial fetch
        fetchData();
    }, [effectiveSchoolId, school, teachers, subjects, classes]);

};

export default useInitData;
