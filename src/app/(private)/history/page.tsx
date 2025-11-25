"use client";

import React from "react";
import type { NextPage } from "next";
import styles from "./history.module.css";
import PreviewTable from "@/components/tables/previewTable/PreviewTable/PreviewTable";
import { useHistoryTable } from "@/context/HistoryTableContext";
import NotPublished from "@/components/empty/NotPublished/NotPublished";
import DailySkeleton from "@/components/loading/skeleton/DailySkeleton/DailySkeleton";

const HistorySchedulePage: NextPage = () => {
    const { mainDailyTable, selectedYearDate, isLoading } = useHistoryTable();

    if (isLoading) return <DailySkeleton />;

    return (
        <section className={styles.container}>
            <PreviewTable
                mainDailyTable={mainDailyTable}
                selectedDate={selectedYearDate}
                EmptyTable={NotPublished}
            />
        </section>
    );
};

export default HistorySchedulePage;
