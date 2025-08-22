import React from "react";
import { NextPage } from "next";
import styles from "./teachers.module.css";
import TeachersList from "@/components/teacherDetails/TeachersList/TeachersList";

const TeachersPage: NextPage = () => {
    return (
        <main className={styles.container}>
            <section className={styles.teachersList}>
                <TeachersList />
            </section>
        </main>
    );
};

export default TeachersPage;
