import React from "react";
import styles from "./DeleteWarningContent.module.css";
import { IoWarningOutline } from "react-icons/io5";

interface DeleteWarningContentProps {
    title: string;
    warningText?: string;
    usageCount?: number;
}

export const DeleteWarningContent: React.FC<DeleteWarningContentProps> = ({
    title,
    warningText,
    usageCount = 0,
}) => {
    return (
        <div className={styles.container}>
            <h2 className={styles.title}>{title}</h2>
            {usageCount > 0 && (
                <div className={styles.warningBox}>
                    <div className={styles.warningHeader}>
                        <IoWarningOutline className={styles.warningIcon} size={20} />
                        <span className={styles.warningTitle}>שימו לב: קיים שימוש במערכת</span>
                    </div>
                    <p className={styles.warningMessage}>
                        {warningText || `משובץ/ת ב-${usageCount} שיעורים במערכת השנתית.`}
                    </p>
                    <p className={styles.warningSubMessage}>
                        מחיקה תסיר את כל השיבוצים הללו מהמערכת. האם להמשיך?
                    </p>
                </div>
            )}
        </div>
    );
};

export default DeleteWarningContent;
