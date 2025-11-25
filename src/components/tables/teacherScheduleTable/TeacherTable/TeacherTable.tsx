"use client";

import React from "react";
import { TableRows } from "@/models/constant/table";
import TeacherHeader from "../TeacherHeader/TeacherHeader";
import TeacherRow from "../TeacherRow/TeacherRow";
import styles from "./TeacherTable.module.css";
import { usePortalContext } from "@/context/PortalContext";

type TeacherTableProps = {};

const TeacherTable: React.FC<TeacherTableProps> = ({}) => {
    const { selectedDate, mainPortalTable } = usePortalContext();
    const dayTable = selectedDate ? mainPortalTable[selectedDate] : undefined;
    const isDayLoaded = dayTable !== undefined;
    const hasData = isDayLoaded && Object.keys(dayTable).length > 0;

    return (
        <table className={styles.scheduleTable}>
            <TeacherHeader />
            <tbody className={styles.scheduleTableBody}>
                {Array.from({ length: TableRows }, (_, i) => i + 1).map((hour) => {
                    const row = dayTable?.[String(hour)];
                    return <TeacherRow key={hour} hour={hour} row={row} />;
                })}
            </tbody>
        </table>
    );
};

export default TeacherTable;
