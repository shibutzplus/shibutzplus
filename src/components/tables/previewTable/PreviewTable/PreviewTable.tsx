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
import { TeacherType } from "@/models/types/teachers";
import { TeacherTableProvider } from "@/context/TeacherTableContext";
import TeacherTable from "../../teacherScheduleTable/TeacherTable/TeacherTable";

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

    const [isPanelOpen, setIsPanelOpen] = useState<boolean>(false);
    const [teacher, setTeacher] = useState<TeacherType>();

    const handleTeacherClick = async (teacher: TeacherType) => {
        setTeacher(teacher);
        setIsPanelOpen(true);
    };

    const handleClosePanel = () => {
        setIsPanelOpen(false);
    };

    return (
        <TeacherTableProvider>
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

            <SlidingPanel isOpen={isPanelOpen} onClose={handleClosePanel} title={teacher?.name || ""}>
                {teacher ? (
                    <TeacherTable teacher={teacher} selectedDate={selectedDate} isInsidePanel />
                ) : null}
            </SlidingPanel>
        </TeacherTableProvider>
    );
};

export default PreviewTable;
