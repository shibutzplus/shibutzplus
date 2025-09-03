import React from "react";
import { NextPage } from "next";
import styles from "../lists.module.css";
import ClassesList from "@/components/classDetails/ClassesList/ClassesList";

const ClassesPage: NextPage = () => {
    return (
        <main className={styles.container}>
            <section className={styles.pageList}>
                <ClassesList />
            </section>
        </main>
    );
};

export default ClassesPage;
