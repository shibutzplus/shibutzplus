"use client";

import React from "react";
import { NextPage } from "next";
import DailySkeleton from "@/components/loading/skeleton/DailySkeleton/DailySkeleton";
import { useDailyTableContext } from "@/context/DailyTableContext";
import styles from "./DailySchedule.module.css";
import DailyTable from "@/components/tables/dailyScheduleTable/DailyTable/DailyTable";
import PreviewTable from "@/components/tables/previewTable/PreviewTable/PreviewTable";

const DailySchedulePage: NextPage = () => {
    const { isLoading, isEditMode } = useDailyTableContext();

    if (isLoading) return <DailySkeleton />;

    return (
        <section className={styles.container}>
            {isEditMode ? <DailyTable /> : <PreviewTable />}
        </section>
    );
};

export default DailySchedulePage;
