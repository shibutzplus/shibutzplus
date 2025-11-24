"use client";

import React, { useState } from "react";
import styles from "./PreviewTable.module.css";
import HoursCol from "@/components/ui/table/HoursCol/HoursCol";
import { TableRows } from "@/models/constant/table";
import { sortDailyColumnIdsByType } from "@/utils/sort";
import PreviewCol from "../PreviewCol/PreviewCol";
import SlidingPanel from "@/components/ui/SlidingPanel/SlidingPanel";
import { DailySchedule } from "@/models/types/dailySchedule";
import { AppType } from "@/models/types";

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

    const [isPanelOpen, setIsPanelOpen] = useState(false);
    const [selectedTeacherName, setSelectedTeacherName] = useState("");

    const handleTeacherClick = (teacherName: string) => {
        setSelectedTeacherName(teacherName);
        setIsPanelOpen(true);
    };

    const handleClosePanel = () => {
        setIsPanelOpen(false);
    };

    return (
        <>
            <div className={styles.previewTable}>
                <HoursCol hours={TableRows} />
                {schedule && Object.keys(schedule).length > 0 ? (
                    sortedTableColumns.map((colId) => (
                        <PreviewCol
                            key={colId}
                            columnId={colId}
                            appType={appType}
                            selectedDate={selectedDate}
                            mainDailyTable={mainDailyTable}
                            onTeacherClick={handleTeacherClick}
                        />
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
