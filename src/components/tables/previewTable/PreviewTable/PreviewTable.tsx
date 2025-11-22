"use client";

import React, { useState } from "react";
import styles from "./PreviewTable.module.css";
import HoursCol from "@/components/ui/table/HoursCol/HoursCol";
import { useDailyTableContext } from "@/context/DailyTableContext";
import { TableRows } from "@/models/constant/table";
import { sortDailyColumnIdsByType } from "@/utils/sort";
import EmptyTable from "@/components/empty/EmptyTable/EmptyTable";
import PreviewCol from "../PreviewCol/PreviewCol";
import SlidingPanel from "@/components/ui/SlidingPanel/SlidingPanel";

const PreviewTable: React.FC = () => {
    const { mainDailyTable, selectedDate } = useDailyTableContext();
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

    //TODO
    // if (scheduleData.length === 0)
    //     return <NotPublishedLayout title={noScheduleTitle} subTitle={noScheduleSubTitle} />;

    return (
        <>
            <div className={styles.previewTable}>
                <HoursCol hours={TableRows} />
                {schedule && Object.keys(schedule).length > 0 ? (
                    sortedTableColumns.map((colId) => (
                        <PreviewCol
                            key={colId}
                            columnId={colId}
                            column={mainDailyTable[selectedDate][colId]}
                            onTeacherClick={handleTeacherClick}
                        />
                    ))
                ) : (
                    <EmptyTable />
                )}
            </div>

            <SlidingPanel isOpen={isPanelOpen} onClose={handleClosePanel}>
                <h2>{selectedTeacherName}</h2>
            </SlidingPanel>
        </>
    );
};

export default PreviewTable;
