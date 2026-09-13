"use client";

import React, { useState, useEffect, useRef } from "react";
import { usePopup } from "@/context/PopupContext";
import Loading from "@/components/loading/Loading/Loading";
import messages from "@/resources/messages";
import { AutoAssignSummaryItem } from "@/utils/autoSubstitution";
import styles from "./AutoAssignPopup.module.css";

export interface AutoAssignExecutionResult {
    assignedCount: number;
    unassignedCount: number;
    assignments: AutoAssignSummaryItem[];
}

interface AutoAssignPopupProps {
    onExecute: (setProgressText: (text: string) => void) => Promise<AutoAssignExecutionResult>;
    onComplete?: () => void;
}

type PopupView = "loading" | "explain" | "noCandidates" | "error";

const AutoAssignPopup: React.FC<AutoAssignPopupProps> = ({ onExecute, onComplete }) => {
    const { closePopup } = usePopup();
    const [view, setView] = useState<PopupView>("loading");
    const [progressText, setProgressText] = useState<string>(messages.dailySchedule.autoAssignStep1);
    const [result, setResult] = useState<AutoAssignExecutionResult | null>(null);
    const [errorMessage, setErrorMessage] = useState<string>("");
    const executedRef = useRef(false);

    useEffect(() => {
        if (executedRef.current) return;
        executedRef.current = true;

        const run = async () => {
            try {
                const res = await onExecute((text) => setProgressText(text));
                setResult(res);

                if (res.assignedCount > 0) {
                    setView("explain");
                } else {
                    setView("noCandidates");
                }

                if (onComplete) onComplete();
            } catch (err) {
                setErrorMessage(err instanceof Error ? err.message : messages.dailySchedule.autoAssignError);
                setView("error");
                if (onComplete) onComplete();
            }
        };

        run();
    }, [onExecute, onComplete]);

    const handleClose = () => {
        closePopup();
    };

    // 1. Loading View
    if (view === "loading") {
        return (
            <div className={styles.popupContent}>
                <div className={styles.loadingContainer}>
                    <Loading size="M" />
                    <div className={styles.loadingText}>{progressText}</div>
                </div>
            </div>
        );
    }

    // 2. Explain View (Grouped by missing teacher)
    if (view === "explain" && result) {
        const assignments = result.assignments || [];

        // Group assignments by missing teacher in column order (as displayed on screen)
        const teacherMap = new Map<string, AutoAssignSummaryItem[]>();
        assignments.forEach((item) => {
            const name = item.columnTeacherName || "כללי";
            if (!teacherMap.has(name)) teacherMap.set(name, []);
            teacherMap.get(name)!.push(item);
        });

        const teacherGroups = Array.from(teacherMap.entries()).map(
            ([name, items]) => [name, items.sort((a, b) => a.hour - b.hour)] as const
        );

        return (
            <div className={styles.popupContent}>
                <div className={styles.explainContainer}>
                    <div className={styles.explainHeader}>
                        <h2 className={styles.explainTitle}>
                            פירוט השיבוצים <span className={styles.countText}>({assignments.length} שיבוצים)</span>
                        </h2>
                    </div>

                    <div className={styles.assignmentsList}>
                        {teacherGroups.length === 0 ? (
                            <div className={styles.subtitle}>לא נמצאו שיבוצים להצגה</div>
                        ) : (
                            teacherGroups.map(([teacherName, items]) => (
                                <div key={teacherName} className={styles.teacherCard}>
                                    <div className={styles.teacherCardHeader}>
                                        {teacherName}:
                                    </div>
                                    <ul className={styles.hourList}>
                                        {items.map((item, idx) => {
                                            const classDisplay = item.className
                                                ? item.className.includes("כיתה")
                                                    ? `(${item.className})`
                                                    : `(כיתה ${item.className})`
                                                : "";

                                            return (
                                                <li key={`${teacherName}-${item.hour}-${idx}`} className={styles.hourItem}>
                                                    <span className={styles.hourPrefix}>שעה {item.hour}</span>
                                                    {classDisplay && <span className={styles.classLabel}> {classDisplay}</span>}
                                                    {item.isReleased ? (
                                                        <span className={styles.releasedText}> | שחרור כיתה (סוף יום)</span>
                                                    ) : item.isUnassigned ? (
                                                        <span className={styles.unassignedText}> | לא נמצא שיבוץ מתאים</span>
                                                    ) : (
                                                        <>
                                                            <span className={styles.subTeacher}>
                                                                {" | "}{item.subTeacherName}
                                                            </span>
                                                            {item.reason && (
                                                                <span className={styles.reasonText}>
                                                                    {": "}{item.reason}
                                                                </span>
                                                            )}
                                                        </>
                                                    )}
                                                </li>
                                            );
                                        })}
                                    </ul>
                                </div>
                            ))
                        )}
                    </div>

                    <div className={styles.disclaimerText}>
                        ⚖️ השיבוצים הינם המלצה אלגוריתמית מבוססת בינה מלאכותית בלבד ואינם יכולים להחליף את שיקול דעת המנהל/ת.
                    </div>

                    <div className={styles.explainActions}>
                        <button
                            type="button"
                            className={styles.closeButtonFull}
                            onClick={handleClose}
                            autoFocus
                        >
                            סגור
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // 3. Error View
    if (view === "error") {
        return (
            <div className={styles.popupContent}>
                <h2 className={styles.title}>{errorMessage || messages.dailySchedule.autoAssignError}</h2>
                <div className={styles.buttonContainer}>
                    <button type="button" className={styles.secondaryButton} onClick={handleClose} autoFocus>
                        סגור
                    </button>
                </div>
            </div>
        );
    }

    // 4. No Candidates View
    if (view === "noCandidates") {
        return (
            <div className={styles.popupContent}>
                <h2 className={styles.title}>{messages.dailySchedule.autoAssignNoCandidates}</h2>
                <div className={styles.buttonContainer}>
                    <button type="button" className={styles.secondaryButton} onClick={handleClose} autoFocus>
                        סגור
                    </button>
                </div>
            </div>
        );
    }

    return null;
};

export default AutoAssignPopup;
