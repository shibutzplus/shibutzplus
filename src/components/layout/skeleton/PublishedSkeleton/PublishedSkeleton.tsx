import React from "react";
import { NextPage } from "next";
import styles from "./PublishedSkeleton.module.css";
import { TableRows } from "@/models/constant/table";

const PublishedSkeleton: NextPage = () => {
    const ColsNumber = 6;
    return (
        <div className={styles.content}>
            <div className={styles.tableWrapper}>
                <section className={styles.tableContainer} aria-label="טבלת מערכת יומית">
                    <table className={styles.scheduleTable}>
                        <thead>
                            <tr>
                                <th className={styles.hourHeader}></th>
                                {Array.from({ length: ColsNumber }, (_, i) => i + 1).map((hour) => (
                                    <th key={hour} className={styles.dayHeader}>
                                        <div className={styles.thSkeletonName} />
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {Array.from({ length: TableRows }, (_, i) => i + 1).map((hour) => (
                                <tr key={hour}>
                                    <td className={styles.hourCell}>
                                        <div className={styles.cellContent}>
                                            <span>{hour}</span>
                                        </div>
                                    </td>
                                    {Array.from({ length: ColsNumber }, (_, i) => i + 1).map(
                                        (columnId) => (
                                            <td key={columnId} className={styles.scheduleCell}>
                                                <div className={styles.cellContent}>
                                                    <div className={styles.teacherCell}>
                                                        <div className={styles.tdSkeleton1} />
                                                        <div className={styles.tdSkeleton2} />
                                                        <div className={styles.tdSkeleton3} />
                                                    </div>
                                                </div>
                                            </td>
                                        ),
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </section>
            </div>
        </div>
    );
};

export default PublishedSkeleton;
