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
import SlidingPanel from "@/components/ui/SlidingPanel/SlidingPanel";
import TeacherTable from "../../teacherScheduleTable/TeacherTable/TeacherTable";
import { TeacherTableProvider, useTeacherTableContext } from "@/context/TeacherTableContext";
import { TeacherType } from "@/models/types/teachers";

type DailyTableProps = {
    mainDailyTable: DailySchedule;
    selectedDate: string;
};

const DailyTable: React.FC<DailyTableProps> = ({ mainDailyTable, selectedDate }) => {
    const schedule = mainDailyTable[selectedDate];
    const tableColumns = schedule ? Object.keys(schedule) : [];
    const sortedTableColumns = useSortColumns(schedule, mainDailyTable, selectedDate, tableColumns);

    const [isPanelOpen, setIsPanelOpen] = React.useState(false);
    const [teacher, setTeacher] = React.useState<TeacherType>();

    const handleTeacherClick = (teacher: TeacherType) => {
        setTeacher(teacher);
        setIsPanelOpen(true);
    };

    const handleClosePanel = () => {
        setIsPanelOpen(false);
    };

    return (
        <div className={styles.dailyTable}>
            <div className={styles.hide} />
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
                                    onTeacherClick={handleTeacherClick}
                                />
                            </motion.div>
                        ))
                ) : (
                    <EmptyTable />
                )}
            </AnimatePresence>

            <TeacherTableProvider>
                <SlidingPanel
                    isOpen={isPanelOpen}
                    onClose={handleClosePanel}
                    title={teacher?.name || ""}
                >
                    {teacher ? (
                        <TeacherPanelFetcher
                            teacher={teacher}
                            selectedDate={selectedDate}
                        />
                    ) : null}
                </SlidingPanel>
            </TeacherTableProvider>
        </div>
    );
};

const TeacherPanelFetcher: React.FC<{ teacher: TeacherType; selectedDate: string }> = ({
    teacher,
    selectedDate,
}) => {
    const { fetchTeacherScheduleDate } = useTeacherTableContext();

    React.useEffect(() => {
        fetchTeacherScheduleDate(teacher, selectedDate);
    }, [teacher, selectedDate]);

    return <TeacherTable teacher={teacher} selectedDate={selectedDate} isInsidePanel />;
};

export default DailyTable;
