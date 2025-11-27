"use client";

import React from "react";
import { NextPage } from "next";
import DailySkeleton from "@/components/loading/skeleton/DailySkeleton/DailySkeleton";
import { useDailyTableContext } from "@/context/DailyTableContext";
import styles from "./DailySchedule.module.css";
import DailyTable from "@/components/tables/dailyScheduleTable/DailyTable/DailyTable";
import PreviewTable from "@/components/tables/previewTable/PreviewTable/PreviewTable";
import EmptyTable from "@/components/empty/EmptyTable/EmptyTable";
import LoadingPage from "@/components/loading/LoadingPage/LoadingPage";

const DailySchedulePage: NextPage = () => {
    const { isLoading, isEditMode, selectedDate, mainDailyTable, isLoadingEditPage } =
        useDailyTableContext();

    if (isLoading) return <DailySkeleton />;
    if (isLoadingEditPage) return <LoadingPage />;

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
