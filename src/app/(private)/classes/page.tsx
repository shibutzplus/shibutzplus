import React from "react";
import { NextPage } from "next";
import styles from "./classes.module.css";
import ClassesList from "@/components/classDetails/ClassesList/ClassesList";

const ClassesPage: NextPage = () => {
    return (
        <main className={styles.container}>
            <section className={styles.classesList}>
                <ClassesList />
            </section>
        </main>
    );
};

export default ClassesPage;
