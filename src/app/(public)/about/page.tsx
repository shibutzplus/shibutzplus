"use client";

import React from "react";
import { NextPage } from "next";
import { ActionBar } from "@/components/ActionBar/ActionBar";
import styles from "./about.module.css";
import { Header } from "@/components/Header";
import { TableProvider } from "@/context/TableContext";
import DailyTable from "@/components/DailyTable/DailyTable";

const AboutPage: NextPage = () => {
    return (
        <div className={styles.pageContainer}>
            <header className={styles.headerContainer}>
                <div className={styles.titleGroup}>
                    <h1 className={styles.title}>מערכת יום ב׳</h1>
                    <p className={styles.subtitle}>חלוקת מורים לפי שעות</p>
                </div>
            </header>
            <div className={styles.content}>
                <TableProvider>
                    <ActionBar />
                    <DailyTable />
                </TableProvider>
            </div>
        </div>
    );
};

export default AboutPage;
