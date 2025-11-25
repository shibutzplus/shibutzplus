"use client";

import React, { useState } from "react";
import { motion } from "motion/react";
import styles from "./PreviewTable.module.css";
import HoursCol from "@/components/ui/table/HoursCol/HoursCol";
import { TableRows } from "@/models/constant/table";
import { sortDailyColumnIdsByType } from "@/utils/sort";
import PreviewCol from "../PreviewCol/PreviewCol";
import SlidingPanel from "@/components/ui/SlidingPanel/SlidingPanel";
import { DailySchedule } from "@/models/types/dailySchedule";
import { AppType } from "@/models/types";
import { useDailyTableContext } from "@/context/DailyTableContext";
import LoadingPage from "@/components/loading/LoadingPage/LoadingPage";

type PreviewTableProps = {
    mainDailyTable: DailySchedule;
    selectedDate: string;
    appType?: AppType;
    EmptyTable?: React.FC;
};

const PreviewTable: React.FC<PreviewTableProps> = ({
    mainDailyTable,
    selectedDate,
    EmptyTable,
    appType = "private",
}) => {
    const schedule = mainDailyTable[selectedDate];
    const tableColumns = schedule ? Object.keys(schedule) : [];
    const sortedTableColumns = schedule
        ? sortDailyColumnIdsByType(tableColumns, mainDailyTable, selectedDate)
        : [];

    const { isLoadingEditPage } = useDailyTableContext();
    const [isPanelOpen, setIsPanelOpen] = useState(false);
    const [selectedTeacherName, setSelectedTeacherName] = useState("");

    const handleTeacherClick = (teacherName: string) => {
        setSelectedTeacherName(teacherName);
        setIsPanelOpen(true);
    };

    const handleClosePanel = () => {
        setIsPanelOpen(false);
    };

    if (isLoadingEditPage) return <LoadingPage />;

    return (
        <>
            <div className={styles.previewTable}>
                <div className={styles.hide} />
                <HoursCol hours={TableRows} />
                {schedule && Object.keys(schedule).length > 0 ? (
                    sortedTableColumns.map((colId, index) => (
                        <motion.div
                            key={colId}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.3, delay: index * 0.05 }}
                        >
                            <PreviewCol
                                columnId={colId}
                                appType={appType}
                                selectedDate={selectedDate}
                                mainDailyTable={mainDailyTable}
                                onTeacherClick={handleTeacherClick}
                            />
                        </motion.div>
                    ))
                ) : EmptyTable ? (
                    <EmptyTable />
                ) : null}
            </div>

            <SlidingPanel isOpen={isPanelOpen} onClose={handleClosePanel}>
                <h2>{selectedTeacherName}</h2>
            </SlidingPanel>
        </>
    );
};

export default PreviewTable;
