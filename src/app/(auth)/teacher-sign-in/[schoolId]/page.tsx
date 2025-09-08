"use client";

import styles from "../teacherSignIn.module.css";
import HeroSection from "@/components/layout/HeroSection/HeroSection";
import TeacherAuthForm from "@/components/auth/TeacherAuthForm/TeacherAuthForm";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { getTeacherCookie, setSchoolCookie, setTeacherCookie } from "@/lib/cookies";
import router from "@/routes";
import { SelectOption } from "@/models/types";
import messages from "@/resources/messages";
import { errorToast } from "@/lib/toast";
import { getTeachersAction } from "@/app/actions/GET/getTeachersAction";
import SignInLoadingPage from "@/components/layout/loading/SignInLoadingPage/SignInLoadingPage";

export default function TeacherSignInPage() {
    const params = useParams();
    const route = useRouter();
    const searchParams = useSearchParams();
    const schoolId = params.schoolId as string | undefined;
    const teacherId = searchParams.get("teacher_id") as string | null;

    const [teachers, setTeachers] = useState<SelectOption[]>([]);
    const [isLoadingTeachers, setIsLoadingTeachers] = useState(true);

    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!schoolId) {
            route.push(`${router.teacherSignIn.p}`);
            return;
        }

        // Check if teacherId is provided in URL query params
        if (teacherId) {
            setSchoolCookie(schoolId);
            setTeacherCookie(teacherId);
            route.push(`${router.teacherPortal.p}/${schoolId}/${teacherId}`);
            return;
        }

        // Check if teacher is already selected via cookie
        const selectedTeacherId = getTeacherCookie();
        if (selectedTeacherId) {
            route.push(`${router.teacherPortal.p}/${schoolId}/${selectedTeacherId}`);
            return;
        }

        // Fetch teachers for the given schoolId
        const fetchTeachers = async () => {
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
                } else {
                    errorToast(response.message || messages.teachers.error);
                    route.push(`${router.teacherSignIn.p}`);
                }
            } catch (error) {
                console.error("Error fetching teachers:", error);
                errorToast(messages.teachers.error);
                route.push(`${router.teacherSignIn.p}`);
            } finally {
                setIsLoadingTeachers(false);
            }
        };

        fetchTeachers();
    }, [route, schoolId, teacherId]);

    if (isLoading) {
        return <SignInLoadingPage />;
    }

    return (
        <main className={styles.container}>
            <div className={styles.mainSection}>
                <HeroSection title="מערכת השעות האישית שלכם" description="" />
                <div className={styles.formContainer}>
                    <TeacherAuthForm
                        schoolId={schoolId}
                        teachers={teachers}
                        isLoadingTeachers={isLoadingTeachers}
                    />
                </div>
                <footer className={styles.copyright}>&copy; שיבוץ+, כל הזכויות שמורות. 2025</footer>
            </div>
        </main>
    );
}
