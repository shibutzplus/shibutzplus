import React from "react";
import styles from "./ManagementLayout.module.css";

const ManagementLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return (
        <main className={styles.container}>
            <section className={styles.pageList}>{children}</section>
        </main>
    );
};

export default ManagementLayout;
