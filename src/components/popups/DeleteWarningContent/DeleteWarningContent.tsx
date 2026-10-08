import React from "react";
import styles from "./DeleteWarningContent.module.css";
import Icons from "@/style/icons";

interface DeleteWarningContentProps {
    title: string;
    warningHeaderTitle?: string;
    warningText?: string;
    warningSubMessage?: string;
    usageCount?: number;
}

export const DeleteWarningContent: React.FC<DeleteWarningContentProps> = ({
    title,
    warningHeaderTitle,
    warningText,
    warningSubMessage,
    usageCount = 0,
}) => {
    return (
        <div className={styles.container}>
            <h2 className={styles.title}>{title}</h2>
            {usageCount > 0 && (
                <div className={styles.warningBox}>
                    <div className={styles.warningHeader}>
                        <Icons.warning className={styles.warningIcon} size={20} />
                        <span className={styles.warningTitle}>
                            {warningHeaderTitle || "שימו לב"}
                        </span>
                    </div>
                    <p className={styles.warningMessage}>
                        {warningText || `משובץ/ת ב-${usageCount} שיעורים במערכת השנתית.`}
                    </p>
                    <p className={styles.warningSubMessage}>
                        {warningSubMessage || "מחיקה תסיר את כל השיבוצים הללו מהמערכת. האם להמשיך?"}
                    </p>
                </div>
            )}
        </div>
    );
};

export default DeleteWarningContent;
