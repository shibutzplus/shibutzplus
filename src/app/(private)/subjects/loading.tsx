import React from "react";
import styles from "./SubjectsSkeleton.module.css";

const Loading: React.FC = () => {
    return (
        <main className={styles.container}>
            <section className={styles.subjectsList}>
                <div className={styles.tableSkeleton}>
                    <div className={styles.headerRow} />
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className={styles.row}>
                            <div className={styles.cell} style={{width: '65%'}} />
                            <div className={styles.cell} style={{width: '25%'}} />
                        </div>
                    ))}
                </div>
            </section>
        </main>
    );
};

export default Loading;
