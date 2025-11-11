"use client";

import React from "react";
import { NextPage } from "next";
import DailySkeleton from "@/components/loading/skeleton/DailySkeleton/DailySkeleton";
import { useDailyTableContext } from "@/context/DailyTableContext";
import styles from "./DailySchedule.module.css";
import DailyTable from "@/components/tables/dailyScheduleTable/DailyTable/DailyTable";

const DailySchedulePage: NextPage = () => {
    const { isLoading } = useDailyTableContext();

    if (isLoading) return <DailySkeleton />;

    return (
        <section className={styles.container}>
            <DailyTable />
        </section>
    );
};

export default DailySchedulePage;
