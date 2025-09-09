"use client";

import React from "react";
import { NextPage } from "next";
import DailyTable from "@/components/dailyScheduleTable/DailyTable/DailyTable";
import styles from "./DailySchedule.module.css";
import usePageScroll from "@/hooks/scroll/usePageScroll";

const DailySchedulePage: NextPage = () => {
  usePageScroll("bottomScroller")

  return (
    <section className={styles.container}>
      <DailyTable />
      <div id="bottomScroller" className={styles.bottomScroller} aria-label="horizontal scroller">
        <div className={styles.bottomInner} />
      </div>
    </section>
  );
};

export default DailySchedulePage;
