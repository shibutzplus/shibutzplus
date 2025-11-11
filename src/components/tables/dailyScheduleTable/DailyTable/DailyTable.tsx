"use client";

import React from "react";
import styles from "./DailyTable.module.css";
import DailyCol from "../DailyCol/DailyCol";
import HoursCol from "@/components/ui/table/HoursCol/HoursCol";
import { useDailyTableContext } from "@/context/DailyTableContext";
import { TableRows } from "@/models/constant/table";
import { sortDailyColumnIdsByType } from "@/utils/sort";
import EmptyTable from "@/components/ui/table/EmptyTable/EmptyTable";

const DailyTable: React.FC = () => {
    const { mainDailyTable, selectedDate } = useDailyTableContext();
    const schedule = mainDailyTable[selectedDate];
    const tableColumns = schedule ? Object.keys(schedule) : [];
    const sortedTableColumns = schedule
        ? sortDailyColumnIdsByType(tableColumns, mainDailyTable, selectedDate)
        : [];


    return (
        <div className={styles.dailyTable}>
            <HoursCol hours={TableRows} />
            {schedule && Object.keys(schedule).length > 0 ? (
                sortedTableColumns.map((colId) => (
                    <DailyCol
                        key={colId}
                        columnId={colId}
                        column={mainDailyTable[selectedDate][colId]}
                    />
                ))
            ) : (
                <EmptyTable />
            )}
        </div>
    );
};

export default DailyTable;
