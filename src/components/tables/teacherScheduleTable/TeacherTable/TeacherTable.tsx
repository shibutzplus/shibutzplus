"use client";

import React from "react";
import { TableRows } from "@/models/constant/table";
import TeacherHeader from "../TeacherHeader/TeacherHeader";
import TeacherRow from "../TeacherRow/TeacherRow";
import styles from "./TeacherTable.module.css";
import { useTeacherTableContext } from "@/context/TeacherTableContext";
import { TeacherType } from "@/models/types/teachers";

type TeacherTableProps = {
    teacher?: TeacherType;
    selectedDate: string;
    onlyMobileVersion?: boolean;
};

const TeacherTable: React.FC<TeacherTableProps> = ({ teacher, selectedDate, onlyMobileVersion }) => {
    const { mainPortalTable } = useTeacherTableContext();
    const dayTable = selectedDate ? mainPortalTable[selectedDate] : undefined;

    return (
        <table className={styles.scheduleTable}>
            <TeacherHeader />
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
    );
};

export default TeacherTable;
