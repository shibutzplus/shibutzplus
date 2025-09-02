"use client";

import styles from "../teacherSignIn.module.css";
import HeroSection from "@/components/layout/HeroSection/HeroSection";
import TeacherAuthForm from "@/components/auth/TeacherAuthForm/TeacherAuthForm";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { getTeacherCookie, setTeacherCookie } from "@/utils/cookies";
import router from "@/routes";
import { getTeachersAction } from "@/app/actions/GET/getTeachersAction";
import { SelectOption } from "@/models/types";
import messages from "@/resources/messages";
import { errorToast } from "@/lib/toast";

export default function TeacherSignInPage() {
    const params = useParams();
    const route = useRouter();
    const searchParams = useSearchParams();
    const schoolId = params.schoolId as string;
    const teacherId = searchParams.get("teacher_id");

    const [teachers, setTeachers] = useState<SelectOption[]>([]);
    const [isLoadingTeachers, setIsLoadingTeachers] = useState(true);

    useEffect(() => {
        // Check for remembered teacher first
        const rememberedTeacherId = getTeacherCookie();
        if (rememberedTeacherId) {
            route.push(`${router.teacherPortal.p}/${schoolId}/${rememberedTeacherId}`);
            return;
        }

        const fetchTeachers = async () => {
            try {
                if (teacherId) {
                    setTeacherCookie(teacherId);
                    route.push(`${router.teacherPortal.p}/${schoolId}/${teacherId}`);
                    return;
                }
                setIsLoadingTeachers(true);
                const response = await getTeachersAction(schoolId);
                if (response.success && response.data) {
                    const teacherOptions: SelectOption[] = response.data.map((teacher) => ({
                        value: teacher.id,
                        label: teacher.name,
                    }));
                    setTeachers(teacherOptions);
                } else {
                    errorToast(messages.teachers.error);
                }
            } catch (error) {
                console.error("Error fetching teachers:", error);
                errorToast(messages.teachers.error);
            } finally {
                setIsLoadingTeachers(false);
            }
        };

        fetchTeachers();
    }, [route, schoolId, teacherId]);

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
