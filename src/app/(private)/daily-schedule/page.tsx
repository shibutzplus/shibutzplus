"use client";

import React from "react";
import { NextPage } from "next";
import DailyScheduleTopButtons from "@/components/DailySchedule/DailyScheduleTopButtons";
import DailyScheduleTable from "@/components/DailySchedule/DailyScheduleTable";
import styles from "./DailySchedule.module.css";
import { TableProvider } from "@/context/TableContext";

const DailySchedulePage: NextPage = () => {
    return (
        <div className={styles.container}>
            <TableProvider>
                <DailyScheduleTopButtons />
                <div className={styles.whiteBox}>
                    <DailyScheduleTable />
                </div>
            </TableProvider>
        </div>
    );
};

export default DailySchedulePage;
