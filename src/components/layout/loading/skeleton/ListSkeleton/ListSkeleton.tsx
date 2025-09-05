import React from "react";
import { NextPage } from "next";
import styles from "./ListSkeleton.module.css";

const ListSkeleton: NextPage = () => {
    return (
        <main className={styles.container}>
            <section className={styles.tableSkeleton}>
                <div className={styles.headerRow} />
                <div className={styles.rowAdd}>
                    <div className={styles.cellAdd} />
                    <div className={styles.add} />
                </div>
                {Array.from({ length: 7 }).map((_, i) => (
                    <div key={i} className={styles.row}>
                        <div className={styles.cell} />
                        <div className={styles.circles}>
                            <div className={styles.circle} />
                            <div className={styles.circle} />
                        </div>
                    </div>
                ))}
            </section>
        </main>
    );
};

export default ListSkeleton;
