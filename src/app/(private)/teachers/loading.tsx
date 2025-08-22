import React from "react";
import styles from "./teachersSkeleton.module.css";

const Loading: React.FC = () => {
    return (
        <main className={styles.container}>
            <section className={styles.teachersList}>
                <div className={styles.tableSkeleton}>
                    <div className={styles.headerRow} />
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className={styles.row}>
                            <div className={styles.cell} style={{width: '55%'}} />
                            <div className={styles.cell} style={{width: '25%'}} />
                            <div className={styles.cell} style={{width: '15%'}} />
                        </div>
                    ))}
                </div>
            </section>
        </main>
    );
};

export default Loading;
