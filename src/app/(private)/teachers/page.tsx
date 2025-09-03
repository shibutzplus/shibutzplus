import React from "react";
import { NextPage } from "next";
import styles from "../lists.module.css";
import TeachersList from "@/components/teacherDetails/TeachersList/TeachersList";

const TeachersPage: NextPage = () => {
    return (
        <main className={styles.container}>
            <section className={styles.pageList}>
                <TeachersList />
            </section>
        </main>
    );
};

export default TeachersPage;
