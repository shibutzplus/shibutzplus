"use client";

import React from "react";
import { motion, AnimatePresence } from "motion/react";
import styles from "./DailyTable.module.css";
import DailyCol from "../DailyCol/DailyCol";
import HoursCol from "@/components/ui/table/HoursCol/HoursCol";
import { TableRows } from "@/models/constant/table";
import EmptyTable from "@/components/empty/EmptyTable/EmptyTable";
import { DailySchedule } from "@/models/types/dailySchedule";
import { useSortColumns } from "./useSortColumns";
import { TeacherType } from "@/models/types/teachers";

type DailyTableProps = {
    mainDailyTable: DailySchedule;
    selectedDate: string;
    onTeacherClick: (teacher: TeacherType) => Promise<void>;
};

const DailyTable: React.FC<DailyTableProps> = ({
    mainDailyTable,
    selectedDate,
    onTeacherClick,
}) => {
    const schedule = mainDailyTable[selectedDate];
    const tableColumns = schedule ? Object.keys(schedule) : [];
    const sortedTableColumns = useSortColumns(schedule, mainDailyTable, selectedDate, tableColumns);

    return (
        <div className={styles.dailyTable}>
            {schedule && Object.keys(schedule).length > 0 && <HoursCol hours={TableRows} />}
            <AnimatePresence mode="popLayout">
                {schedule && Object.keys(schedule).length > 0 ? (
                    sortedTableColumns
                        .filter((colId) => tableColumns.includes(colId))
                        .map((colId) => (
                            <motion.div
                                key={colId}
                                layout
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ duration: 0.3 }}
                            >
                                <DailyCol
                                    columnId={colId}
                                    column={mainDailyTable[selectedDate][colId]}
                                    onTeacherClick={onTeacherClick}
                                />
                            </motion.div>
                        ))
                ) : (
                    <EmptyTable />
                )}
            </AnimatePresence>
        </div>
    );
};

export default DailyTable;
