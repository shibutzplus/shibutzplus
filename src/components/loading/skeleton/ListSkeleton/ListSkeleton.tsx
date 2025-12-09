import React from "react";
import styles from "./ListSkeleton.module.css";
import PageSkeleton from "../PageSkeleton/PageSkeleton";

type ListSkeletonProps = {
    titles: [string, string];
    hasAdditionalBtn?: boolean;
};

const ListSkeleton: React.FC<ListSkeletonProps> = ({ titles, hasAdditionalBtn = false }) => {
    return (
        <PageSkeleton>
            <main className={styles.container}>
                <header className={styles.header}>
                    <div className={styles.headerRow}>
                        <div className={styles.headerName}>{titles[0]}</div>
                        <div className={styles.headerActions}>{titles[1]}</div>
                    </div>
                </header>
                <section className={styles.listSection}>
                    {/* Add Row Skeleton */}
                    <div className={styles.addListRow}>
                        <div className={styles.addListRowInput}>
                            <div className={styles.inputSkeleton} />
                        </div>
                        <div className={styles.addListBtn}>
                            <div className={styles.btnSkeleton} />
                        </div>
                    </div>

                    <section className={styles.list}>
                        {Array.from({ length: 8 }, (_, i) => i + 1).map((i) => (
                            <div key={i} className={styles.listRow}>
                                <div className={styles.nameCell}>
                                    <div className={styles.nameSkeleton} />
                                </div>
                                <div className={styles.actions}>
                                    {hasAdditionalBtn && <div className={styles.iconSkeleton} />}
                                    <div className={styles.iconSkeleton} />
                                    <div className={styles.iconSkeleton} />
                                </div>
                            </div>
                        ))}
                    </section>
                </section>
            </main>
        </PageSkeleton>
    );
};

export default ListSkeleton;
