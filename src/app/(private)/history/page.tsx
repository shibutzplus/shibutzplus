"use client";

import React from "react";
import type { NextPage } from "next";
import styles from "./history.module.css";
import PreviewTable from "@/components/tables/previewTable/PreviewTable/PreviewTable";
import { useHistoryTable } from "@/context/HistoryTableContext";
import NotPublished from "@/components/empty/NotPublished/NotPublished";
import Preloader from "@/components/ui/Preloader/Preloader";

const HistorySchedulePage: NextPage = () => {
    const { mainDailyTable, selectedYearDate, isLoading } = useHistoryTable();

    if (isLoading)
        return (
            <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)'
            }}>
                <Preloader />
            </div>
        );

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
