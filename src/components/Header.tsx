import React from "react";
import styles from "./Header.module.css";

export const Header: React.FC = () => (
    <header className={styles.headerContainer}>
        <div className={styles.titleGroup}>
            <h1 className={styles.title}>מערכת יום ב׳</h1>
            <p className={styles.subtitle}>חלוקת מורים לפי שעות</p>
        </div>
        <div /> {/* placeholder for avatar */}
    </header>
);
