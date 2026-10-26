"use client";

import React from "react";
import styles from "./MngrTutoringReportTable.module.css";
import { TutoringReportData } from "@/utils/tutoringReportUtils";
import { useMainContext } from "@/context/MainContext";

type MngrTutoringReportTableProps = {
    reportData: TutoringReportData;
};

const MngrTutoringReportTable: React.FC<MngrTutoringReportTableProps> = ({ reportData }) => {
    const { columns, rows } = reportData;
    const { school } = useMainContext();

    if (rows.length === 0) {
        return <div className={styles.noDataPlaceholder}>אין כיתות להצגה</div>;
    }

    return (
        <div className={styles.tableContainer}>
            <div className={styles.printHeader}>
                <div className={styles.printTitle}>דוח שיבוץ פרטני לכיתות</div>
                {school?.name && <div className={styles.printSchoolName}>{school.name}</div>}
            </div>
            <table className={styles.scheduleTable}>
                <thead>
                    <tr>
                        <th className={`${styles.headerCell} ${styles.classColumn}`}></th>
                        <th className={styles.emptyColSeparator}></th>
                        {columns.map((col) => (
                            <th key={col.id} className={`${styles.headerCell} ${styles.subjectColumn}`}>
                                <div className={styles.headerInner}>{col.name}</div>
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className={styles.scheduleTableBody}>
                    {rows.map((row) => (
                        <tr key={row.classObj.id}>
                            <td className={styles.classColumn}>
                                <div className={styles.classCell}>{row.classObj.name}</div>
                            </td>
                            <td className={styles.emptyCell}></td>
                            {columns.map((col) => {
                                const assignments = row.cells[col.id] || [];
                                return (
                                    <td key={col.id} className={styles.scheduleCell}>
                                        <div className={styles.cellContent}>
                                            {assignments.length > 0 ? (
                                                <div className={styles.teachersList}>
                                                    {assignments.map((item, idx) => (
                                                        <div
                                                            key={`${item.teacherId}_${item.day}_${item.hour}_${idx}`}
                                                            className={styles.teacherItem}
                                                        >
                                                            <span className={styles.teacherName}>
                                                                {item.teacherName}
                                                            </span>
                                                            <span className={styles.timeChip}>
                                                                {item.timeLabel}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <span className={styles.emptyCellContent}>—</span>
                                            )}
                                        </div>
                                    </td>
                                );
                            })}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default MngrTutoringReportTable;
