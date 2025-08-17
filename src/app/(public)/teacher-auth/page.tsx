"use client";

import AuthHero from "@/components/AuthHero/AuthHero";
import TeacherAuthForm from "@/components/TeacherAuthForm/TeacherAuthForm";
import styles from "./teacherAuth.module.css";
import { NextPage } from "next";

const TeacherAuthPage: NextPage = () => {
    return (
        <main className={styles.container}>
            <div className={styles.contentWrapper}>
                <AuthHero />
                <TeacherAuthForm />
            </div>
        </main>
    );
};

export default TeacherAuthPage;
