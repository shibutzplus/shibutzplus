"use client";

import React from "react";
import TeacherMaterialRow from "../TeacherMaterialRow/TeacherMaterialRow";
import styles from "./TeacherTable.module.css";
import { useTeacherTableContext } from "@/context/TeacherTableContext";
import { calculateVisibleRowsForTeacher } from "@/utils/tableUtils";
import { TeacherRoleValues, TeacherType } from "@/models/types/teachers";
import NotPublished from "@/components/empty/NotPublished/NotPublished";
import Preloader from "@/components/ui/Preloader/Preloader";
import { PortalType, PortalTypeVal } from "@/models/types";

type TeacherTableProps = {
    teacher?: TeacherType;
    selectedDate: string;
    isInsidePanel?: boolean;
    fromHour?: number;
    toHour?: number;
    portalType?: PortalTypeVal;
};

const TeacherTable: React.FC<TeacherTableProps> = ({
    teacher,
    selectedDate,
    isInsidePanel,
    fromHour = 1,
    toHour = 10,
    portalType,
}) => {
    const { mainPortalTable, hasFetched, isPortalLoading } = useTeacherTableContext();
    const dayTable = selectedDate ? mainPortalTable[selectedDate] : undefined;

    // Generate rows range
    const rows = React.useMemo(() => {
        return calculateVisibleRowsForTeacher(dayTable, fromHour, toHour);
    }, [dayTable, fromHour, toHour]);

    if (!hasFetched || isPortalLoading || !dayTable)
        return (
            <div className={styles.loaderContainer}>
                <Preloader />
            </div>
        );

    const isEmpty = Object.keys(dayTable).length === 0;
    const hasChanges = !isEmpty && Object.values(dayTable).some((row) => !row.isRegular);

    if (isEmpty || !hasChanges) {
        return (
            <NotPublished
                date={selectedDate}
                text="אין שינויים במערכת האישית"
                displayButton={teacher?.role !== TeacherRoleValues.SUBSTITUTE && portalType !== PortalType.Manager}
            />
        );
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
                    {rows.map((hour) => {
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
