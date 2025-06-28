"use client";

import React from "react";
import { NextPage } from "next";
import DailyScheduleTopButtons from "@/components/table/DailyTable/DailyScheduleTopButtons";
import DailyTable from "@/components/table/DailyTable/DailyTable";
import { TableProvider } from "@/context/TableContext";
import styles from "./DailySchedule.module.css";

const DailySchedulePage: NextPage = () => {
    return (
        <div className={styles.container}>
            <TableProvider>
                <DailyScheduleTopButtons />
                <div className={styles.whiteBox}>
                    <DailyTable />
                </div>
            </TableProvider>
        </div>
    );
};

export default DailySchedulePage;
