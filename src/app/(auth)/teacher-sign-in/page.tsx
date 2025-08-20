"use client";

import AuthHero from "@/components/layout/AuthHero/AuthHero";
import TeacherAuthForm from "@/components/auth/TeacherAuthForm/TeacherAuthForm";
import styles from "./teacherSignIn.module.css";
import { NextPage } from "next";

const TeacherSignIn: NextPage = () => {
    return (
        <main className={styles.container}>
            <div className={styles.contentWrapper}>
                <AuthHero />
                <TeacherAuthForm />
            </div>
        </main>
    );
};

export default TeacherSignIn;
