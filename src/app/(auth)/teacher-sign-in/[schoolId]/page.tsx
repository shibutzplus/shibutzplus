"use client";

import styles from "../teacherSignIn.module.css";
import HeroSection from "@/components/layout/HeroSection/HeroSection";
import TeacherAuthForm from "@/components/auth/TeacherAuthForm/TeacherAuthForm";
import { useParams } from "next/navigation";

export default function TeacherSignInPage() {
    const params = useParams();
    const schoolId = params.schoolId as string;
    return (
        <main className={styles.container}>
            <div className={styles.mainSection}>
                <HeroSection
                    title="פתרון חכם לשיבוץ מורים ושעות"
                    description=""
                />
                <div className={styles.formContainer}>
                    <TeacherAuthForm schoolId={schoolId} />
                </div>
                <footer className={styles.copyright}>&copy; שיבוץ+, כל הזכויות שמורות. 2025</footer>
            </div>
        </main>
    );
}
