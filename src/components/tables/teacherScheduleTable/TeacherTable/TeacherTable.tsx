"use client";

import React from "react";
import { TableRows } from "@/models/constant/table";
import TeacherHeader from "../TeacherHeader/TeacherHeader";
import TeacherRow from "../TeacherRow/TeacherRow";
import styles from "./TeacherTable.module.css";
import { useTeacherTableContext } from "@/context/TeacherTableContext";
import { TeacherType } from "@/models/types/teachers";

import NotPublished from "@/components/empty/NotPublished/NotPublished";
import Preloader from "@/components/ui/Preloader/Preloader";

type TeacherTableProps = {
    teacher?: TeacherType;
    selectedDate: string;
    onlyMobile?: boolean;
    isInsidePanel?: boolean;
};

const TeacherTable: React.FC<TeacherTableProps> = ({ teacher, selectedDate, onlyMobile, isInsidePanel }) => {
    const { mainPortalTable, isPortalLoading } = useTeacherTableContext();
    const dayTable = selectedDate ? mainPortalTable[selectedDate] : undefined;

    if (isPortalLoading)
        return (
            <div className={styles.loaderContainer}>
                <Preloader />
            </div>
        );

    if (!dayTable || Object.keys(dayTable).length === 0) return <NotPublished />;

    return (
        <table className={styles.scheduleTable}>
            <TeacherHeader onlyMobile={onlyMobile} isInsidePanel={isInsidePanel} />
            <tbody className={styles.scheduleTableBody}>
                {Array.from({ length: TableRows }, (_, i) => i + 1).map((hour) => {
                    const row = dayTable?.[String(hour)];
                    return (
                        <TeacherRow
                            key={hour}
                            hour={hour}
                            row={row}
                            teacher={teacher}
                            selectedDate={selectedDate}
                            onlyMobile={onlyMobile}
                        />
                    );
                })}
            </tbody>
        </table>
    );
};

export default TeacherTable;
