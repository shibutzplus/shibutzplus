import React from "react";
import { NextPage } from "next";
import styles from "./AnnualSkeleton.module.css";
import { DAYS_OF_WORK_WEEK } from "@/utils/time";
import { TableRows } from "@/models/constant/table";

const AnnualSkeleton: NextPage = () => {
    return (
        <div className={styles.container}>
            <div className={styles.whiteBox}>
                <div>
                    <table className={styles.scheduleTable}>
                        <thead>
                            <tr>
                                <th className={styles.emptyTrHeader} />
                                {DAYS_OF_WORK_WEEK.map((tr: string) => (
                                    <th
                                        key={tr}
                                        className={styles.trHeader}
                                        style={{
                                            backgroundColor: "#fffbf5",
                                        }}
                                    >
                                        <div className={styles.thSkeleton} />
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {Array.from({ length: TableRows }, (_, i) => i + 1).map((hour) => (
                                <tr key={hour}>
                                    <td
                                        className={styles.hourCell}
                                        style={{ backgroundColor: "#fffbf5" }}
                                    >
                                        {hour}
                                    </td>
                                    {DAYS_OF_WORK_WEEK.map((day) => (
                                        <td key={day} className={styles.scheduleCell}>
                                            <div className={styles.cellContent}>
                                                <div className={styles.tdSkeleton}/>
                                                <div className={styles.tdSkeleton}/>
                                            </div>
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AnnualSkeleton;
