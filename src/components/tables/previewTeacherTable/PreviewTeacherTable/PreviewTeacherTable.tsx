"use client";

import React from "react";
import { TableRows } from "@/models/constant/table";
import PreviewTeacherHeader from "../PreviewTeacherHeader/PreviewTeacherHeader";
import PreviewTeacherRow from "../PreviewTeacherRow/PreviewTeacherRow";
import styles from "./PreviewTeacherTable.module.css";
import { TeacherType } from "@/models/types/teachers";
import { useTeacherTableContext } from "@/context/TeacherTableContext";

type PreviewTeacherTableProps = {
    teacher: TeacherType;
    selectedDate: string;
};

const PreviewTeacherTable: React.FC<PreviewTeacherTableProps> = ({ teacher, selectedDate }) => {
    const { mainPortalTable } = useTeacherTableContext();
    const dayTable = selectedDate ? mainPortalTable[selectedDate] : undefined;

    return (
        <table className={styles.scheduleTable}>
            <PreviewTeacherHeader />
            <tbody className={styles.scheduleTableBody}>
                {Array.from({ length: TableRows }, (_, i) => i + 1).map((hour) => {
                    const row = dayTable?.[String(hour)];
                    return (
                        <PreviewTeacherRow
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

export default PreviewTeacherTable;
