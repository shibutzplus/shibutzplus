"use client";

import React from "react";
import { NextPage } from "next";
import DailyTable from "@/components/dailyScheduleTable/DailyTable/DailyTable";
import styles from "./DailySchedule.module.css";
import { useMobileSize } from "@/hooks/useMobileSize";
import MobileNav from "@/components/navigation/MobileNav/MobileNav";

const DailySchedulePage: NextPage = () => {
    const isMobile = useMobileSize();
    return (
        <section className={styles.container}>
            <DailyTable />
            {isMobile ? <MobileNav /> : null}
        </section>
    );
};

export default DailySchedulePage;
