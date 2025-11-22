"use client";

import React from "react";
import { NextPage } from "next";
import DailySkeleton from "@/components/loading/skeleton/DailySkeleton/DailySkeleton";
import { useDailyTableContext } from "@/context/DailyTableContext";
import styles from "./DailySchedule.module.css";
import DailyTable from "@/components/tables/dailyScheduleTable/DailyTable/DailyTable";
import PreviewTable from "@/components/tables/previewTable/PreviewTable/PreviewTable";
import EmptyTable from "@/components/empty/EmptyTable/EmptyTable";

const DailySchedulePage: NextPage = () => {
    const { isLoading, isEditMode, selectedDate, mainDailyTable } = useDailyTableContext();

    if (isLoading) return <DailySkeleton />;

    return (
        <section className={styles.container}>
            {isEditMode ? (
                <DailyTable mainDailyTable={mainDailyTable} selectedDate={selectedDate} />
            ) : (
                <PreviewTable
                    mainDailyTable={mainDailyTable}
                    selectedDate={selectedDate}
                    EmptyTable={EmptyTable}
                />
            )}
        </section>
    );
};

export default DailySchedulePage;
