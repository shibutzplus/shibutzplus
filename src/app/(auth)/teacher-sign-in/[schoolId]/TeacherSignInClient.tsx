"use client";

// **Teacher Sign-In Logic**
//
// For detailed logic documentation, please refer to:
// docs/login-teacher.md
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
import { setStorageTeacher, getStorageTeacher } from "@/lib/localStorage";
import { getTeacherByIdAction } from "@/app/actions/GET/getTeacherByIdAction";
import { getTeachersAction } from "@/app/actions/GET/getTeachersAction";
import { PortalType } from "@/models/types";
import { logErrorAction } from "@/app/actions/POST/logErrorAction";

interface TeacherSignInClientProps {
    schoolId: string;
    schoolName: string;
}

export default function TeacherSignInClient({
    schoolId,
    schoolName,
}: TeacherSignInClientProps) {
    const route = useRouter();
    const searchParams = useSearchParams();
    const teacherId = searchParams.get("teacher_id");

    const [isLoading, setIsLoading] = useState(true);
    const [teachers, setTeachers] = useState<SelectOption[]>([]);
    const [teachersFull, setTeachersFull] = useState<TeacherType[]>([]);
    const [isLoadingTeachers, setIsLoadingTeachers] = useState(true);

    const fetchTeachers = async () => {
        try {
            const resp = await getTeachersAction(schoolId, { portalType: PortalType.Teacher, includeSubstitutes: false });
            if (resp.success && resp.data) {
                setTeachersFull(resp.data);
                setTeachers(resp.data.map((t: TeacherType) => ({ value: t.id, label: t.name })));
            }
        } catch (error) {
            logErrorAction({ description: `Failed to fetch teachers: ${error instanceof Error ? error.message : String(error)}`, schoolId });
            errorToast(messages.common.serverError);
        } finally {
            setIsLoadingTeachers(false);
        }
    };

    useEffect(() => {
        const isLogout = searchParams.get("auth") === "logout";

        // Case 1: Logout - Just show the form
        if (isLogout) {
            setIsLoading(false);
            fetchTeachers();
            return;
        }

        // Case 2: Only schoolId in URL - Check localStorage logic and show form
        if (!teacherId) {
            const storedTeacherData = getStorageTeacher?.();

            if (storedTeacherData && storedTeacherData.schoolId === schoolId) {
                if (storedTeacherData.role === TeacherRoleValues.STAFF) {
                    route.push(router.scheduleViewPortal.p);
                } else {
                    route.push(`${router.teacherMaterialPortal.p}/${schoolId}/${storedTeacherData.id}`);
                }
                return;
            }

            setIsLoading(false);
            fetchTeachers();
            return;
        }

        // Case 3: Teacher exist in URL - Auto login teacher
        (async () => {
            try {
                setIsLoading(true);
                const decodedTeacherId = decodeURIComponent(teacherId);
                const sanitizedTeacherId = decodedTeacherId.replace(/[^a-zA-Z0-9-_]/g, "");
                const resp = await getTeacherByIdAction(sanitizedTeacherId);

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
                        teachers={teachers}
                        teachersFull={teachersFull}
                        isLoadingTeachers={isLoadingTeachers}
                        isLogout={searchParams.get("auth") === "logout"}
                    />
                </div>
                <footer className={styles.copyright}>&copy; שיבוץ+, כל הזכויות שמורות. 2025</footer>
            </div>
        </main>
    );
}
