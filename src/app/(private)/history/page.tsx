"use client";

import React from "react";
import type { NextPage } from "next";
import styles from "./history.module.css";
import PreviewTable from "@/components/tables/previewTable/PreviewTable/PreviewTable";
import { useHistoryTable } from "@/context/HistoryTableContext";
import PublishedSkeleton from "@/components/loading/skeleton/PublishedSkeleton/PublishedSkeleton";
import NotPublished from "@/components/empty/NotPublished/NotPublished";

const HistorySchedulePage: NextPage = () => {
    const { mainDailyTable, selectedYearDate, isLoading } = useHistoryTable();

    if (isLoading) return <PublishedSkeleton />;

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
