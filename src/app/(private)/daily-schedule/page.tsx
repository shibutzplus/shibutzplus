import React from "react";
import { NextPage } from "next";
import DailyTable from "@/components/table/DailyTable/DailyTable";
import { DailyTableProvider } from "@/context/DailyTableContext";
import styles from "./DailySchedule.module.css";
import DailyTableTopBtns from "@/components/table/DailyTableTopBtns/DailyTableTopBtns";

const DailySchedulePage: NextPage = () => {
    return (
        <DailyTableProvider>
            <section className={styles.container}>
                <DailyTableTopBtns />
                <DailyTable />
            </section>
        </DailyTableProvider>
    );
};

export default DailySchedulePage;
