import React from "react";
import styles from "./LoadingSelectLayout.module.css";

const LoadingSelectLayout = () => {
    return (
        <div className={styles.selectContainer}>
            <div className={styles.select}>
                <span className={styles.text}>טוען...</span>
            </div>
        </div>
    );
};

export default LoadingSelectLayout;
