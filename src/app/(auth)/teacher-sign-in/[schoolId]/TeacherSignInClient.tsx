"use client";

// **Teacher Sign-In Logic**
//
// URL without parameters             → Go to ContactAdminError and display a message.
// URL with a wrong school parameter  → Go to ContactAdminError and display a message.
// URL with `school_id` only          → Show regular teacher list for that school. (Clear only if substitute teacher in localStorage)
// URL with `school_id` + `teacher_id`→ Auto-login to the teacher’s portal
// URL with `auth=logout`             → Display Login but show teacher list only for regular teachers
//
import styles from "../teacherSignIn.module.css";
import HeroSection from "@/components/auth/HeroSection/HeroSection";
import TeacherAuthForm from "@/components/auth/TeacherAuthForm/TeacherAuthForm";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import router from "@/routes";
import { SelectOption } from "@/models/types";
import SignInLoadingPage from "@/components/loading/SignInLoadingPage/SignInLoadingPage";
import { errorToast } from "@/lib/toast";
import messages from "@/resources/messages";
import { TeacherType, TeacherRoleValues } from "@/models/types/teachers";
import { setStorageTeacher, getStorageTeacher, removeStorageTeacher } from "@/lib/localStorage";
import { getTeacherByIdAction } from "@/app/actions/GET/getTeacherByIdAction";
import { logErrorAction } from "@/app/actions/POST/logErrorAction";

interface TeacherSignInClientProps {
    schoolId: string;
    schoolName: string;
    initialTeachers: SelectOption[];
    initialTeachersFull: TeacherType[];
}

export default function TeacherSignInClient({
    schoolId,
    schoolName,
    initialTeachers,
    initialTeachersFull,
}: TeacherSignInClientProps) {
    const route = useRouter();
    const searchParams = useSearchParams();
    const teacherId = searchParams.get("teacher_id");

    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const isLogout = searchParams.get("auth") === "logout";

        // Case 1: Logout - Just show the form
        if (isLogout) {
            setIsLoading(false);
            return;
        }

        // Case 2: No teacher_id in URL - Check localStorage logic and show form
        if (!teacherId) {
            const storedTeacherData = getStorageTeacher?.();
            if (storedTeacherData?.role === TeacherRoleValues.SUBSTITUTE) {
                removeStorageTeacher(); // Clear local storage only if substitute
            }
            setIsLoading(false);
            return;
        }

        // Case 3: Teacher exist in URL - Auto login teacher
        (async () => {
            try {
                // Determine if we need to fetch teacher details or if we can find them in the passed props?
                // The original code fetched by ID, which is safer as it verifies existence in DB.
                // We will keep using the server action for this specific flow to ensure up-to-date role/data.
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
                    if (t.role === TeacherRoleValues.STAFF) {
                        route.push(router.scheduleViewPortal.p);
                        return;
                    }
                    route.push(`${router.teacherMaterialPortal.p}/${schoolId}/${t.id}`);
                    return;
                }
                errorToast(messages.auth.login.failed);
            } catch (e) {
                logErrorAction({ description: `Error in teacher_id auto login: ${e instanceof Error ? e.message : String(e)}`, schoolId });
                errorToast(messages.auth.login.failed);
            } finally {
                setIsLoading(false);
            }
        })();
    }, [teacherId, searchParams, route, schoolId]);

    if (isLoading) {
        return <SignInLoadingPage />;
    }

    return (
        <main className={styles.container}>
            <div className={styles.heroBackground}>
                <div className={`${styles.blob} ${styles.blob1}`} />
                <div className={`${styles.blob} ${styles.blob2}`} />
            </div>
            <div className={styles.mainSection}>
                <HeroSection
                    title="מערכת השעות היומית שלכם"
                    description={`בית ספר ${schoolName}`}
                />
                <div className={styles.formContainer}>
                    <TeacherAuthForm
                        schoolId={schoolId}
                        teachers={initialTeachers}
                        teachersFull={initialTeachersFull}
                        isLoadingTeachers={false}
                    />
                </div>
                <footer className={styles.copyright}>&copy; שיבוץ+, כל הזכויות שמורות. 2025</footer>
            </div>
        </main>
    );
}
