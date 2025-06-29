"use client";

import React from "react";
import { NextPage } from "next";
import DailyTable from "@/components/table/DailyTable/DailyTable";
import { TableProvider } from "@/context/TableContext";
import styles from "./DailySchedule.module.css";
import DailyTableTopBtns from "@/components/table/DailyTableTopBtns/DailyTableTopBtns";

const DailySchedulePage: NextPage = () => {
    return (
        <TableProvider>
            <section className={styles.container}>
                <DailyTableTopBtns />
                <DailyTable />
            </section>
        </TableProvider>
    );
};

export default DailySchedulePage;
