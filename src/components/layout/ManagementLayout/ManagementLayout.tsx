import React from "react";
import styles from "./ManagementLayout.module.css";

type ManagementLayoutProps = {
    formTitle: string;
    listTitle: string;
    listInfo: string;
    children: [React.ReactNode, React.ReactNode];
};

const ManagementLayout: React.FC<ManagementLayoutProps> = ({
    formTitle,
    listTitle,
    listInfo,
    children,
}) => {
    return (
        <main className={styles.container}>
            <section className={styles.teachersListSection}>
                <h1 className={styles.title}>{listTitle}</h1>
                <div className={styles.teachersCount}>{listInfo}</div>
                {children[0]}
            </section>
            <section className={styles.formSection}>
                <h2 className={styles.formTitle}>{formTitle}</h2>
                {children[1]}
            </section>
        </main>
    );
};

export default ManagementLayout;
