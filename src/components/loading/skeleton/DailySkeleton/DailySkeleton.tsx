import React from "react";
import { NextPage } from "next";
import styles from "./DailySkeleton.module.css";
import { TableRows } from "@/models/constant/table";
import HoursCol from "@/components/ui/table/HoursCol/HoursCol";
import Loading from "@/components/loading/Loading/Loading";
import PageSkeleton from "../PageSkeleton/PageSkeleton";

const DailySkeleton: NextPage = () => {
    return (
        <PageSkeleton>
            <section className={styles.container}>
                <div className={styles.dailyTable}>
                    <HoursCol hours={TableRows} />
                    <div className={styles.dailyColumn}>
                        <div className={styles.headerSkeleton} />
                        <div className={styles.rows}>
                            {Array.from({ length: TableRows }, (_, i) => i + 1).map((hour) => (
                                <div key={hour} className={styles.rowSkeleton} />
                            ))}
                        </div>
                    </div>
                    <div className={styles.dailyColumn}>
                        <div className={styles.headerSkeleton} />
                        <div className={styles.rows}>
                            {Array.from({ length: TableRows }, (_, i) => i + 1).map((hour) => (
                                <div key={hour} className={styles.rowSkeleton} />
                            ))}
                        </div>
                    </div>
                    <div className={styles.loadingContainer}>
                        <Loading size="L" color="var(--skeleton-input-color)" />
                    </div>
                </div>
            </section>
        </PageSkeleton>
    );
};

export default DailySkeleton;
