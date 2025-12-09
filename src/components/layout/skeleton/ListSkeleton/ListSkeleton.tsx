import React from "react";
import styles from "./ListSkeleton.module.css";

type ListSkeletonProps = {
    headThs: string[];
    hasAdditionalBtn?: boolean;
};

const ListSkeleton: React.FC<ListSkeletonProps> = ({ headThs, hasAdditionalBtn = false }) => {
    return (
        <div className={styles.container}>
            <section className={styles.tableListSection}>
                <table className={styles.tableList}>
                    <thead>
                        <tr>
                            {headThs.map((headTh) => (
                                <th key={headTh}>{headTh}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>
                                <div className={styles.tdSkeletonInput} />
                            </td>
                            <td>
                                <div className={styles.tdSkeletonBtn} />
                            </td>
                        </tr>
                        {Array.from({ length: 15 }, (_, i) => i + 1).map((i) => (
                            <tr key={i} className={styles.listRow}>
                                <td className={styles.nameCell}>
                                    <div className={styles.tdSkeletonName} />
                                </td>

                                <td className={styles.actions}>
                                    {hasAdditionalBtn && <div className={styles.tdSkeletonIcon} />}
                                    <div className={styles.tdSkeletonIcon} />
                                    <div className={styles.tdSkeletonIcon} />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </section>
        </div>
    );
};

export default ListSkeleton;
