"use client";

import React from "react";
import { NextPage } from "next";
import DailyTable from "@/components/dailyScheduleTable/DailyTable/DailyTable";
import styles from "./DailySchedule.module.css";
import usePageScroll from "@/hooks/scroll/usePageScroll";
import { useDailyTableContext } from "@/context/DailyTableContext";
import DailySkeleton from "@/components/layout/skeleton/DailySkeleton/DailySkeleton";

const DailySchedulePage: NextPage = () => {
    const { isLoading } = useDailyTableContext();
    usePageScroll("bottomScroller");

    if (isLoading) return <DailySkeleton />;

    return (
        <section className={styles.container}>
            <DailyTable />
            <div
                id="bottomScroller"
                className={styles.bottomScroller}
                aria-label="horizontal scroller"
            >
                <div className={styles.bottomInner} />
            </div>
        </section>
    );
};

export default DailySchedulePage;
