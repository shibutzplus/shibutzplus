"use client";

import React from "react";
import { TableRows } from "@/models/constant/table";
import TeacherRow from "../TeacherRow/TeacherRow";
import styles from "./TeacherTable.module.css";
import { useTeacherTableContext } from "@/context/TeacherTableContext";
import { TeacherType } from "@/models/types/teachers";

import NotPublished from "@/components/empty/NotPublished/NotPublished";
import Preloader from "@/components/ui/Preloader/Preloader";

type TeacherTableProps = {
    teacher?: TeacherType;
    selectedDate: string;
    isInsidePanel?: boolean;
};

const TeacherTable: React.FC<TeacherTableProps> = ({ teacher, selectedDate, isInsidePanel }) => {
    const { mainPortalTable, hasFetched } = useTeacherTableContext();
    const dayTable = selectedDate ? mainPortalTable[selectedDate] : undefined;

    if (!hasFetched)
        return (
            <div className={styles.loaderContainer}>
                <Preloader />
            </div>
        );

    if (!dayTable || Object.keys(dayTable).length === 0) return <NotPublished date={selectedDate} />;

    return (
        <div className={styles.tableContainer}>
            <table className={styles.scheduleTable}>
                <thead className={isInsidePanel ? styles.theadInsidePanel : ""}>
                    <tr>
                        <th className={styles.emptyColSeparator}></th>
                        <th className={`${styles.headerCell} ${styles.hoursColumn}`}>
                            <div className={`${styles.headerInner} ${styles.hoursHeader}`}></div>
                        </th>
                        <th className={styles.emptyColSeparator}></th>
                        <th className={`${styles.headerCell} ${styles.detailsColumn}`}>
                            <div className={styles.headerInner}>ממלא מקום</div>
                        </th>
                        <th className={`${styles.headerCell} ${styles.instructionsColumn}`}>
                            <div className={styles.headerInner}>חומר לימוד</div>
                        </th>
                    </tr>
                </thead>
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
                            />
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
};

export default TeacherTable;
