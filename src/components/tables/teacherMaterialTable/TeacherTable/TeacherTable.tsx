"use client";

import React from "react";
import { TableRows } from "@/models/constant/table";
import TeacherMaterialRow from "../TeacherMaterialRow/TeacherMaterialRow";
import styles from "./TeacherTable.module.css";
import { useTeacherTableContext } from "@/context/TeacherTableContext";
import { calculateVisibleRowsForTeacher } from "@/utils/tableUtils";
import { TeacherType } from "@/models/types/teachers";
import NotPublished from "@/components/empty/NotPublished/NotPublished";
import Preloader from "@/components/ui/Preloader/Preloader";

type TeacherTableProps = {
    teacher?: TeacherType;
    selectedDate: string;
    isInsidePanel?: boolean;
    hoursNum?: number;
};

const TeacherTable: React.FC<TeacherTableProps> = ({
    teacher,
    selectedDate,
    isInsidePanel,
    hoursNum,
}) => {
    const { mainPortalTable, hasFetched, isPortalLoading } = useTeacherTableContext();
    const dayTable = selectedDate ? mainPortalTable[selectedDate] : undefined;

    let rowsCount = hoursNum || TableRows;

    // Calculate dynamic rows based on content

    if (dayTable) {
        const rows = calculateVisibleRowsForTeacher(dayTable, hoursNum);
        rowsCount = rows.length;
    }

    if (!hasFetched || isPortalLoading || !dayTable)
        return (
            <div className={styles.loaderContainer}>
                <Preloader />
            </div>
        );

    const isEmpty = Object.keys(dayTable).length === 0;
    const hasChanges = !isEmpty && Object.values(dayTable).some((row) => !row.isRegular);

    if (isEmpty || !hasChanges) {
        return <NotPublished date={selectedDate} text="אין שינויים במערכת האישית" displayButton={true} />;
    }

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
                            <div className={styles.headerInner}>שיעור</div>
                        </th>
                        <th className={`${styles.headerCell} ${styles.instructionsColumn}`}>
                            <div className={styles.headerInner}>חומר לימוד</div>
                        </th>
                    </tr>
                </thead>
                <tbody className={styles.scheduleTableBody}>
                    {Array.from({ length: rowsCount }, (_, i) => i + 1).map((hour) => {
                        const row = dayTable?.[String(hour)];
                        return (
                            <TeacherMaterialRow
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
