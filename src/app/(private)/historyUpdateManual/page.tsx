"use client";

import React, { useState } from "react";
import ActionBtn from "@/components/ui/buttons/ActionBtn/ActionBtn";
import { runHistoryUpdateAction } from "@/app/actions/POST/runHistoryUpdateAction";

import styles from "./historyUpdateManual.module.css";
import { successToast, errorToast } from "@/lib/toast";

export default function ManualHistoryPage() {
    const [loading, setLoading] = useState(false);
    const [logs, setLogs] = useState<string[]>([]);
    const [stats, setStats] = useState<{ schoolsUpdated: number; recordsCount: number } | null>(null);

    const handleRunUpdate = async () => {
        setLoading(true);
        setLogs([]);
        setStats(null);
        try {
            const result = await runHistoryUpdateAction();

            if (result.success) {
                successToast(result.message);
            } else {
                errorToast(result.message);
            }

            setLogs(result.logs || []);
            if (result.stats) {
                setStats(result.stats);
            }
        } catch (e) {
            console.error(e);
            errorToast("אירעה שגיאה לא צפויה.");
        } finally {
            setLoading(false);
        }
    };



    return (
        <div className={styles.container}>

            <div className={styles.controls}>
                <p className={styles.description}>
                    כלי זה מפעיל ידנית את תהליך עדכון ההיסטוריה.
                    הוא מעביר לארכיון את מערכת השעות של היום הקודם לטבלת ההיסטוריה עבור כל בתי הספר שפרסמו מערכת.
                </p>
                <div className={styles.buttonWrapper} style={{ gap: '10px' }}>
                    <ActionBtn
                        label="יש להפעיל תהליך עדכון עבור היום - אחרי שעה 16:00"
                        func={handleRunUpdate}
                        isLoading={loading}
                        isDisabled={loading}
                        className={styles.actionButton}
                    />

                </div>
            </div>

            {stats && (
                <div className={styles.statsCard}>
                    <h3>תוצאות</h3>
                    <div className={styles.statItem}>
                        <span>בתי ספר שעודכנו:</span>
                        <strong>{stats.schoolsUpdated}</strong>
                    </div>
                    <div className={styles.statItem}>
                        <span>רשומות בארכיון:</span>
                        <strong>{stats.recordsCount}</strong>
                    </div>
                </div>
            )}

            {logs.length > 0 && (
                <div className={styles.logsContainer}>
                    <h3>לוגים של התהליך</h3>
                    <div className={styles.logsOutput}>
                        {logs.map((log, i) => (
                            <div key={i} className={styles.logLine}>
                                <span className={styles.logIndex}>{i + 1}.</span>
                                {log}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
