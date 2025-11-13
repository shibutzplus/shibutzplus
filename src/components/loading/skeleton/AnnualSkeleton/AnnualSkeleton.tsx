import React from "react";
import { NextPage } from "next";
import styles from "./AnnualSkeleton.module.css";
import { DAYS_OF_WORK_WEEK } from "@/utils/time";
import { TableRows } from "@/models/constant/table";

const AnnualSkeleton: NextPage = () => {
    return (
        <div className={styles.container}>
            <table className={styles.scheduleTable}>
                <thead className={styles.thead}>
                    <tr>
                        <th className={styles.hourCol}></th>
                        <th className={styles.emptyTrHeader}></th>
                        {DAYS_OF_WORK_WEEK.map((day: string) => (
                            <th key={day} className={styles.trHeader} />
                        ))}
                    </tr>
                </thead>
                <tbody className={styles.scheduleTableBody}>
                    {Array.from({ length: TableRows }, (_, i) => i + 1).map((hour) => (
                        <tr key={hour} className={styles.annualRow}>
                            <td className={styles.hoursColumn}>
                                <div className={styles.hourCell}>{hour}</div>
                            </td>
                            <td className={styles.emptyCell}></td>
                            {DAYS_OF_WORK_WEEK.map((day) => (
                                <td key={day} className={styles.scheduleCell}>
                                    <div className={styles.cellContent}>
                                        <div className={styles.tdSkeleton} />
                                        <div className={styles.tdSkeleton} />
                                    </div>
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default AnnualSkeleton;
