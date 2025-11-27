"use client";

import React from "react";
import { TableRows } from "@/models/constant/table";
import PreviewTeacherHeader from "../PreviewTeacherHeader/PreviewTeacherHeader";
import PreviewTeacherRow from "../PreviewTeacherRow/PreviewTeacherRow";
import styles from "./PreviewTeacherTable.module.css";
import { useDailyTableContext } from "@/context/DailyTableContext";
import { TeacherType } from "@/models/types/teachers";

type PreviewTeacherTableProps = {
    teacher: TeacherType;
};

const PreviewTeacherTable: React.FC<PreviewTeacherTableProps> = ({ teacher }) => {
    const { selectedDate, mainPortalTable } = useDailyTableContext();
    const dayTable = selectedDate ? mainPortalTable[selectedDate] : undefined;

    return (
        <table className={styles.scheduleTable}>
            <PreviewTeacherHeader />
            <tbody className={styles.scheduleTableBody}>
                {Array.from({ length: TableRows }, (_, i) => i + 1).map((hour) => {
                    const row = dayTable?.[String(hour)];
                    return <PreviewTeacherRow key={hour} hour={hour} row={row} teacher={teacher} />;
                })}
            </tbody>
        </table>
    );
};

export default PreviewTeacherTable;
