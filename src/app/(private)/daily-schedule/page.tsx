"use client";

import React from "react";
import { NextPage } from "next";
import DailyTable from "@/components/dailyScheduleTable/DailyTable/DailyTable";
import styles from "./DailySchedule.module.css";
import MobileNav from "@/components/navigation/MobileNav/MobileNav";
import { useMobileSize } from "@/hooks/useMobileSize";
import usePageScroll from "@/hooks/scroll/usePageScroll";

const DailySchedulePage: NextPage = () => {
  const isMobile = useMobileSize();
  usePageScroll("bottomScroller")

  return (
    <section className={styles.container}>
      <DailyTable />
      <div id="bottomScroller" className={styles.bottomScroller} aria-label="horizontal scroller">
        <div className={styles.bottomInner} />
      </div>
      {isMobile ? <MobileNav /> : null}
    </section>
  );
};

export default DailySchedulePage;
