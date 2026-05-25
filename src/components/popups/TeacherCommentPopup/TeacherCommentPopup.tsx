"use client";

import React, { useState } from "react";
import styles from "./TeacherCommentPopup.module.css";
import { DailyScheduleCell } from "@/models/types/dailySchedule";
import { updateDailyTeacherCommentAction } from "@/app/actions/PUT/updateDailyTeacherCommentAction";
import { errorToast } from "@/lib/toast";

type HourEntry = {
    hour: number;
    label: string;
    initialComment: string;
};

type TeacherCommentPopupProps = {
    teacherName: string;
    columnId: string;
    selectedDate: string;
    columnCells: Record<string, DailyScheduleCell>;
    schoolId: string;
    onSaved: (updatedComments: Record<number, string>) => void;
    onCancel: () => void;
};

const TeacherCommentPopup: React.FC<TeacherCommentPopupProps> = ({
    teacherName,
    columnId,
    selectedDate,
    columnCells,
    schoolId,
    onSaved,
    onCancel,
}) => {
    // Only show hours where the teacher actually teaches (has classes or subject)
    const hourEntries: HourEntry[] = Object.entries(columnCells)
        .filter(([, cell]) => cell.classes?.length || cell.subject)
        .sort(([a], [b]) => Number(a) - Number(b))
        .map(([hourKey, cell]) => {
            const hour = Number(hourKey);
            const classNames = cell.classes?.map((c) => c.name).join(", ") || "";
            const subjectName = cell.subject?.name || "";
            const label = [classNames, subjectName].filter(Boolean).join(" • ");
            return { hour, label, initialComment: cell.comment || "" };
        });

    const [comments, setComments] = useState<Record<number, string>>(
        () => Object.fromEntries(hourEntries.map((e) => [e.hour, e.initialComment]))
    );
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async () => {
        // Only update hours whose comment actually changed
        const changed = hourEntries.filter(
            (e) => (comments[e.hour] ?? "") !== e.initialComment
        );
        if (changed.length === 0) {
            onCancel();
            return;
        }

        setIsSaving(true);
        try {
            const results = await Promise.all(
                changed.map((e) => {
                    const cell = columnCells[e.hour];
                    const additionalData = {
                        day: new Date(selectedDate).getDay() + 1,
                        position: cell?.headerCol?.position || 0,
                        columnType: cell?.headerCol?.type || 1,
                        originalTeacherId: cell?.headerCol?.headerTeacher?.id,
                        subjectId: cell?.subject?.id,
                        classIds: cell?.classes?.map((c) => c.id),
                    };

                    return updateDailyTeacherCommentAction(
                        schoolId,
                        selectedDate,
                        columnId,
                        e.hour,
                        comments[e.hour] ?? "",
                        additionalData
                    );
                })
            );

            const anyFailed = results.some((r) => !r.success);
            if (anyFailed) {
                errorToast("שגיאה בשמירת חלק מההודעות");
            }

            // Build map of saved values (even partial success)
            const savedComments: Record<number, string> = {};
            changed.forEach((e, i) => {
                if (results[i]?.success) {
                    savedComments[e.hour] = comments[e.hour] ?? "";
                }
            });

            onSaved(savedComments);
        } catch {
            errorToast("שגיאה בשמירת ההודעות");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className={styles.popupContent} onMouseDown={(e) => e.stopPropagation()}>
            <div className={styles.title}>הודעות עבור {teacherName} ומורים מחליפים</div>

            <div className={styles.hoursList}>
                {hourEntries.length === 0 ? (
                    <div className={styles.emptyState}>אין שעות ללמד היום</div>
                ) : (
                    hourEntries.map((entry) => (
                        <div key={entry.hour} className={styles.hourBlock}>
                            <div className={styles.hourLabel}>
                                <span className={styles.hourBadge}>{entry.hour}</span>
                                <span className={styles.hourSubject}>{entry.label}</span>
                            </div>
                            <textarea
                                className={styles.commentTextarea}
                                value={comments[entry.hour] ?? ""}
                                onChange={(e) =>
                                    setComments((prev) => ({ ...prev, [entry.hour]: e.target.value }))
                                }
                                placeholder="הודעה למורה..."
                                maxLength={150}
                                rows={2}
                                dir="rtl"
                            />
                        </div>
                    ))
                )}
            </div>

            <div className={styles.buttonContainer}>
                <button
                    className={styles.confirmButton}
                    onClick={handleSave}
                    disabled={isSaving}
                >
                    {isSaving ? "שומר..." : "אישור"}
                </button>
                <button
                    className={styles.cancelButton}
                    onClick={onCancel}
                    disabled={isSaving}
                >
                    ביטול
                </button>
            </div>
        </div>
    );
};

export default TeacherCommentPopup;
