"use client";

import React from "react";
import { motion } from "motion/react";
import styles from "./PreviewTable.module.css";
import HoursCol from "@/components/ui/table/HoursCol/HoursCol";
import { TableRows } from "@/models/constant/table";
import { sortDailyColumnIdsByType } from "@/utils/sort";
import PreviewCol from "../PreviewCol/PreviewCol";
import { DailySchedule } from "@/models/types/dailySchedule";
import { AppType } from "@/models/types";
import { TeacherType } from "@/models/types/teachers";

type PreviewTableProps = {
    mainDailyTable: DailySchedule;
    selectedDate: string;
    onTeacherClick: (teacher: TeacherType) => Promise<void>;
    appType?: AppType;
    EmptyTable?: React.FC;
};

const PreviewTable: React.FC<PreviewTableProps> = ({
    mainDailyTable,
    selectedDate,
    onTeacherClick,
    EmptyTable,
    appType = "private",
}) => {
    const schedule = mainDailyTable[selectedDate];
    const tableColumns = schedule ? Object.keys(schedule) : [];
    const sortedTableColumns = schedule
        ? sortDailyColumnIdsByType(tableColumns, mainDailyTable, selectedDate)
        : [];

    return (
        <div className={styles.previewTable}>
            <HoursCol hours={TableRows} />
            {schedule && Object.keys(schedule).length > 0 ? (
                sortedTableColumns.map((colId, index) => (
                    <motion.div
                        key={colId}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.02 }}
                    >
                        <PreviewCol
                            columnId={colId}
                            appType={appType}
                            selectedDate={selectedDate}
                            mainDailyTable={mainDailyTable}
                            onTeacherClick={onTeacherClick}
                        />
                    </motion.div>
                ))
            ) : EmptyTable ? (
                <EmptyTable />
            ) : null}
        </div>
    );
};

export default PreviewTable;
