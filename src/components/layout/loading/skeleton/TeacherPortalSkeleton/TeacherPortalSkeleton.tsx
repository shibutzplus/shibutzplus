import React from "react";
import styles from "./TeacherPortalSkeleton.module.css";
import { TableRows } from "@/models/constant/table";
import { HourRowColor } from "@/style/tableColors";

const TeacherPortalSkeleton: React.FC = () => {
    return (
        <section className={styles.content}>
            <div className={styles.whiteBox}>
                <div className={styles.tableContainer} role="region">
                    <table className={styles.scheduleTable}>
                        <thead>
                            <tr>
                                <th></th>
                                <th>
                                    <div className={styles.thContainer}>
                                        <div className={styles.thSkeletonClass} />
                                    </div>
                                </th>
                                <th>
                                    <div className={styles.thContainer}>
                                        <div className={styles.thSkeletonInstractions} />
                                    </div>
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {Array.from({ length: TableRows }, (_, i) => i + 1).map((hour) => (
                                <tr key={hour}>
                                    <td
                                        className={styles.hourCell}
                                        style={{ backgroundColor: HourRowColor }}
                                    >
                                        {hour}
                                    </td>
                                    <td className={styles.scheduleCell}>
                                        <div className={styles.cellContent}>
                                            <div className={styles.tdSkeleton} />
                                            <div className={styles.tdSkeleton} />
                                            <div className={styles.tdSkeleton} />
                                        </div>
                                    </td>
                                    <td className={styles.scheduleCellInput}>
                                        <div className={styles.tdSkeletonInstraction1} />
                                        <div className={styles.tdSkeletonInstraction2} />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </section>
    );
};

export default TeacherPortalSkeleton;
