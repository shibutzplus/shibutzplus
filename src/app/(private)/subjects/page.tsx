import React from "react";
import { NextPage } from "next";
import styles from "../lists.module.css";
import SubjectsList from "@/components/subjectDetails/SubjectsList/SubjectsList";

const SubjectsPage: NextPage = () => {
    return (
        <main className={styles.container}>
            <section className={styles.pageList}>
                <SubjectsList />
            </section>
        </main>
    );
};

export default SubjectsPage;
