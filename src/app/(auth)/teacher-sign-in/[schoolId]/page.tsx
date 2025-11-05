// **Teacher Sign-In Logic**
//
// URL without parameters             → Go to teacher login and show a wrong URL message.
// URL with `school_id` only          → Show regular teacher list for that school. (Clear only if substitute teacher in localStorage)
// URL with `school_id` + `teacher_id`→ Auto-login to the teacher’s portal
// URL with `auth=logout`             → Display Login but show teacher list only for regular teachers

"use client";

import styles from "../teacherSignIn.module.css";
import HeroSection from "@/components/layout/HeroSection/HeroSection";
import TeacherAuthForm from "@/components/auth/TeacherAuthForm/TeacherAuthForm";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import router from "@/routes";
import { SelectOption } from "@/models/types";
import { getTeachersAction } from "@/app/actions/GET/getTeachersAction";
import SignInLoadingPage from "@/components/loading/SignInLoadingPage/SignInLoadingPage";
import { errorToast } from "@/lib/toast";
import messages from "@/resources/messages";
import { TeacherType } from "@/models/types/teachers";
import { setStorageTeacher, getStorageTeacher, removeStorageTeacher } from "@/lib/localStorage";
import { getTeacherByIdAction } from "@/app/actions/GET/getTeacherByIdAction";
import { getSchoolAction } from "@/app/actions/GET/getSchoolAction";

export default function TeacherSignInPage() {
    const params = useParams();
    const route = useRouter();
    const searchParams = useSearchParams();
    const schoolId = params.schoolId as string | undefined;
    const teacherId = searchParams.get("teacher_id") as string | null;

    const [teachers, setTeachers] = useState<SelectOption[]>([]);
    const [teachersFull, setTeachersFull] = useState<TeacherType[]>([]);
    const [isLoadingTeachers, setIsLoadingTeachers] = useState(true);
    const [isLoading, setIsLoading] = useState(true);
    const [schoolName, setSchoolName] = useState<string>("");

    const fetchTeachers = async () => {
        if (!schoolId) return;
        try {
            setIsLoading(false);
            setIsLoadingTeachers(true);
            const response = await getTeachersAction(schoolId, { isPrivate: false, hasSub: false });
            if (response.success && response.data) {
                const teacherOptions: SelectOption[] = response.data.map((teacher) => ({
                    value: teacher.id,
                    label: teacher.name,
                }));
                setTeachers(teacherOptions);
                setTeachersFull(response.data);
            } else {    // Back to login page on error
                route.push(`${router.teacherSignIn.p}`);
            }
        } catch (error) {
            console.error("Error fetching teachers:", error);
            errorToast(messages.auth.login.failed);
            route.push(`${router.teacherSignIn.p}`);
        } finally {
            setIsLoadingTeachers(false);
        }
    };

    const fetchSchool = async () => {
        if (!schoolId) return;
        try {
            const resp = await getSchoolAction(schoolId);
            if (resp.success && resp.data) {
                setSchoolName(resp.data.name);
            }
        } catch (error) {
            //console.error("Error fetching school:", error);
        }
    };

    useEffect(() => {
        if (!schoolId) {
            route.push(`${router.teacherSignIn.p}`);
            return;
        }

        fetchSchool();

        const isLogout = searchParams.get("auth") === "logout";
        if (isLogout) {
            setIsLoading(false);
            setIsLoadingTeachers(true);
            fetchTeachers();
            return;
        }

        // Important: check first no-teacher in url
        if (!teacherId) {
            const storedTeacherData = getStorageTeacher?.();
            if (storedTeacherData?.role === "substitute") removeStorageTeacher();  // Clear local storage only if substitute
            setIsLoading(false);
            setIsLoadingTeachers(true);
            fetchTeachers();
            return;
        }

        // Teacher exist in URL: Auto login teacher
        (async () => {
            try {
                setIsLoading(true);
                const resp = await getTeacherByIdAction(teacherId);
                if (resp.success && resp.data) {
                    const t = resp.data as TeacherType;
                    const safeTeacher: TeacherType = {
                        id: t.id,
                        name: t.name,
                        role: t.role,
                        schoolId: t.schoolId,
                    };
                    setStorageTeacher(safeTeacher);
                    route.push(`${router.teacherPortal.p}/${schoolId}/${t.id}`);
                    return;
                }
                errorToast(messages.auth.login.failed);
            } catch (e) {
                console.error("Error in teacher_id auto login:", e);
                errorToast(messages.auth.login.failed);
            } finally {
                setIsLoading(false);
            }
        })();
    }, [route, schoolId, teacherId, searchParams]);

    if (isLoading) {
        return <SignInLoadingPage />;
    }

    return (
        <main className={styles.container}>
            <div className={styles.mainSection}>
                <HeroSection title="מערכת השעות האישית שלכם" description="" />
                <div className={styles.formContainer}>
                    <div className={styles.formInner}>
                        {schoolName && <h2 className={styles.schoolName}>בית ספר {schoolName}</h2>}
                        <TeacherAuthForm
                            schoolId={schoolId}
                            teachers={teachers}
                            teachersFull={teachersFull}
                            isLoadingTeachers={isLoadingTeachers}
                        />
                    </div>
                </div>
                <footer className={styles.copyright}>&copy; שיבוץ+, כל הזכויות שמורות. 2025</footer>
            </div>
        </main>
    );
}
