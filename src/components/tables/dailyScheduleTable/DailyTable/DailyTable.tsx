"use client";

import React from "react";
import styles from "./DailyTable.module.css";
import DailyCol from "../DailyCol/DailyCol";
import HoursCol from "@/components/ui/table/HoursCol/HoursCol";
import { useDailyTableContext } from "@/context/DailyTableContext";
import { TableRows } from "@/models/constant/table";
import { sortDailyColumnIdsByType } from "@/utils/sort";
import useHeaderVisibility from "@/hooks/scroll/useHeaderVisibility";

const HeaderTrigger: React.FC<{ width: string }> = ({ width }) => {
    // Hidden trigger element for header visibility detection
    return <div data-header-trigger="true" className={styles.headerTrigger} style={{ width }} />;
};

const DailyTable: React.FC = () => {
    // useHeaderVisibility();
    const { mainDailyTable, selectedDate } = useDailyTableContext();
    const schedule = mainDailyTable[selectedDate];
    const tableColumns = schedule ? Object.keys(schedule) : [];
    const sortedTableColumns = schedule
        ? sortDailyColumnIdsByType(tableColumns, mainDailyTable, selectedDate)
        : [];

    return (
        <div className={styles.dailyTable}>
            <HoursCol hours={TableRows} />
            {/* {schedule ? <HeaderTrigger width={`${sortedTableColumns.length * 245}px`} /> : null} */}
            {schedule ? (
                sortedTableColumns.map((colId) => (
                    <DailyCol
                        key={colId}
                        columnId={colId}
                        column={mainDailyTable[selectedDate][colId]}
                    />
                ))
            ) : (
                <div>nothing yet</div>
            )}
        </div>
    );
};

export default DailyTable;
