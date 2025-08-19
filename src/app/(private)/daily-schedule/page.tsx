import React from "react";
import { NextPage } from "next";
import DailyTable from "@/components/dailyScheduleTable/DailyTable/DailyTable";
import styles from "./DailySchedule.module.css";

const DailySchedulePage: NextPage = () => {
    return (
        <section className={styles.container}>
            <DailyTable />
        </section>
    );
};

export default DailySchedulePage;
