import React from "react";
import { NextPage } from "next";
import styles from "./AnnualSkeleton.module.css";

const AnnualSkeleton: NextPage = () => {
    return (
        <main className={styles.container}>
            <section className={styles.tableSkeleton}>
                {/* Header row with days of the week */}
                <div className={styles.headerRow}>
                    {Array.from({ length: 7 }).map((_, i) => (
                        <div key={i} className={styles.headerCell} />
                    ))}
                </div>
                
                {/* Table rows with hour cells and dropdown skeletons */}
                {Array.from({ length: 9 }).map((_, rowIndex) => (
                    <div key={rowIndex} className={styles.row}>
                        <div className={styles.hourCell} />
                        {Array.from({ length: 6 }).map((_, colIndex) => (
                            <div key={colIndex} className={styles.cell}>
                                <div className={styles.dropdown} />
                                <div className={styles.dropdown} />
                            </div>
                        ))}
                    </div>
                ))}
            </section>
        </main>
    );
};

export default AnnualSkeleton;
