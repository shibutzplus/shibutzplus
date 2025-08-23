"use client";

import React from "react";
import { NextPage } from "next";
import SubstitutesList from "@/components/substituteDetails/SubstitutesList/SubstitutesList";
import styles from "./substitute.module.css";

const SubstitutePage: NextPage = () => {
    return (
        <main className={styles.container}>
            <section className={styles.substituteList}>
                <SubstitutesList />
            </section>
        </main>
    );
};

export default SubstitutePage;
