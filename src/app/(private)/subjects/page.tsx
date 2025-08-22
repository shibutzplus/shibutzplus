import React from "react";
import { NextPage } from "next";
import styles from "./subjects.module.css";
import SubjectsList from "@/components/subjectDetails/SubjectsList/SubjectsList";

const SubjectsPage: NextPage = () => {
    return (
        <main className={styles.container}>
            <section className={styles.subjectsList}>
                <SubjectsList />
            </section>
        </main>
    );
};

export default SubjectsPage;
