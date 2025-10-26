"use client";

import React from "react";
import { NextPage } from "next";
import DailySkeleton from "@/components/layout/skeleton/DailySkeleton/DailySkeleton";
import { useDailyTableContext } from "@/context/DailyTableContext";
import styles from "./DailySchedule.module.css";
import DailyTable from "@/components/tables/dailyScheduleTable/DailyTableP/DailyTable";

const DailySchedulePage: NextPage = () => {
    // const { isLoading } = useDailyTableContext();
    const isLoading = false;

    if (isLoading) {
        return (
            <div className={styles.loadingWrapper}>
                <DailySkeleton />
                <div className={styles.loader}></div>
            </div>
        );
    }

    return (
        <section className={styles.container}>
            <DailyTable />
        </section>
    );
};

export default DailySchedulePage;
