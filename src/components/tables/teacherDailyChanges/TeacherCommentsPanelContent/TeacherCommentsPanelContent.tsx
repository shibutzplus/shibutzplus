"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import tableStyles from "../TeacherDailyChangesTable/TeacherDailyChangesTable.module.css";
import rowStyles from "../TeacherDailyChangesRow/TeacherDailyChangesRow.module.css";
import cellStyles from "./TeacherCommentsPanelContent.module.css";
import detailsStyles from "../TeacherDailyChangesDetailsCell/TeacherDailyChangesDetailsCell.module.css";
import { DailyScheduleCell, ColumnTypeValues } from "@/models/types/dailySchedule";
import { getCellDisplayData } from "@/utils/dailyCellDisplay";
import { updateDailyTeacherCommentAction } from "@/app/actions/PUT/updateDailyTeacherCommentAction";
import { errorToast } from "@/lib/toast";

type HourEntry = {
    hour: number;
    displayText: string;
    classNameText: string;
    subjectText: string;
    subTeacherName: string;
    isActivity: boolean;
    initialComment: string;
};

export type CommentPanelData = {
    teacherName: string;
    columnId: string;
    columnCells: Record<string, DailyScheduleCell>;
    schoolId: string;
};

type TeacherCommentsPanelContentProps = {
    data: CommentPanelData;
    selectedDate: string;
    onUpdate: (hour: number, comment: string) => void;
};

const DEBOUNCE_MS = 600;

const TeacherCommentsPanelContent: React.FC<TeacherCommentsPanelContentProps> = ({
    data,
    selectedDate,
    onUpdate,
}) => {
    const { columnId, columnCells, schoolId } = data;

    const hourEntries: HourEntry[] = Object.entries(columnCells)
        .filter(([, cell]) => cell.classes?.length || cell.subject)
        .sort(([a], [b]) => Number(a) - Number(b))
        .map(([hourKey, cell]) => {
            const { text: displayText, classNameText, subjectText, isActivity, subTeacherName } = getCellDisplayData(
                cell,
                ColumnTypeValues.missingTeacher
            );
            return {
                hour: Number(hourKey),
                displayText,
                classNameText: classNameText || displayText,
                subjectText: subjectText || "",
                subTeacherName: subTeacherName || "",
                isActivity,
                initialComment: cell.comment || "",
            };
        });

    const [comments, setComments] = useState<Record<number, string>>(
        () => Object.fromEntries(hourEntries.map((e) => [e.hour, e.initialComment]))
    );
    const debounceRefs = useRef<Record<number, ReturnType<typeof setTimeout>>>({});

    useEffect(() => {
        return () => {
            Object.values(debounceRefs.current).forEach(clearTimeout);
        };
    }, []);

    const saveComment = useCallback(
        async (hour: number, comment: string, initialComment: string) => {
            if (comment === initialComment) return;

            const cell = columnCells[hour];
            const additionalData = {
                day: new Date(selectedDate).getDay() + 1,
                position: cell?.headerCol?.position || 0,
                columnType: cell?.headerCol?.type || 1,
                originalTeacherId: cell?.headerCol?.headerTeacher?.id,
                subjectId: cell?.subject?.id,
                classIds: cell?.classes?.map((c) => c.id),
            };

            try {
                const result = await updateDailyTeacherCommentAction(
                    schoolId,
                    selectedDate,
                    columnId,
                    hour,
                    comment,
                    additionalData
                );
                if (result.success) {
                    onUpdate(hour, comment);
                } else {
                    errorToast("שגיאה בשמירת ההודעה");
                }
            } catch {
                errorToast("שגיאה בשמירת ההודעה");
            }
        },
        [columnCells, columnId, schoolId, selectedDate, onUpdate]
    );

    const handleChange = (hour: number, value: string, initialComment: string) => {
        setComments((prev) => ({ ...prev, [hour]: value }));

        if (debounceRefs.current[hour]) {
            clearTimeout(debounceRefs.current[hour]);
        }
        debounceRefs.current[hour] = setTimeout(() => {
            saveComment(hour, value, initialComment);
        }, DEBOUNCE_MS);
    };

    if (hourEntries.length === 0) {
        return (
            <div className={cellStyles.emptyState}>אין שעות ללמד היום</div>
        );
    }

    const renderLessonDetails = (entry: HourEntry) => (
        <div className={detailsStyles.cellContent}>
            <div className={detailsStyles.combinedContent}>
                <span
                    className={`${detailsStyles.classAndSubject} ${entry.isActivity ? detailsStyles.activityText : ""
                        } ${entry.subTeacherName ? detailsStyles.hasSub : ""}`}
                >
                    {entry.classNameText || entry.displayText}
                    {entry.subjectText && (
                        <span className={detailsStyles.subjectName}> {entry.subjectText}</span>
                    )}
                </span>
                {entry.subTeacherName && (
                    <span className={detailsStyles.subTeacher}>
                        <span className={detailsStyles.subName}>
                            {entry.subTeacherName}
                        </span>
                    </span>
                )}
            </div>
        </div>
    );

    return (
        <div className={tableStyles.tableWrapper}>
            <div className={tableStyles.tableContainer}>
                <table className={tableStyles.scheduleTable}>
                    <thead className={tableStyles.theadInsidePanel}>
                        <tr>
                            <th className={tableStyles.emptyColSeparator}></th>
                            <th className={`${tableStyles.headerCell} ${tableStyles.hoursColumn}`}>
                                <div className={`${tableStyles.headerInner} ${tableStyles.hoursHeader}`}></div>
                            </th>
                            <th className={tableStyles.emptyColSeparator}></th>
                            <th className={`${tableStyles.headerCell} ${tableStyles.detailsColumn}`}>
                                <div className={tableStyles.headerInner}>שיעור</div>
                            </th>
                            <th className={`${tableStyles.headerCell} ${tableStyles.instructionsColumn}`}>
                                <div className={tableStyles.headerInner}>הודעות</div>
                            </th>
                        </tr>
                    </thead>
                    <tbody className={tableStyles.scheduleTableBody}>
                        {hourEntries.map((entry) => (
                            <tr key={entry.hour} className={rowStyles.teacherRow}>
                                <td className={rowStyles.emptyCell}></td>
                                <td className={rowStyles.hoursColumn}>
                                    <div className={rowStyles.hourCell}>{entry.hour}</div>
                                </td>
                                <td className={rowStyles.emptyCell}></td>

                                {/* Details cell - desktop */}
                                <td className={`${rowStyles.scheduleDetailsCell} ${rowStyles.desktopOnly}`}>
                                    {renderLessonDetails(entry)}
                                </td>

                                {/* Comment cell */}
                                <td className={`${rowStyles.scheduleInstructionsCell} ${cellStyles.instructionsCell}`}>
                                    {/* Mobile: show label above textarea */}
                                    <div className={rowStyles.mobileDetails}>
                                        {renderLessonDetails(entry)}
                                    </div>
                                    <div className={cellStyles.commentCell}>
                                        <textarea
                                            className={cellStyles.textarea}
                                            value={comments[entry.hour] ?? ""}
                                            onChange={(e) =>
                                                handleChange(entry.hour, e.target.value, entry.initialComment)
                                            }
                                            placeholder={`הודעה...`}
                                            maxLength={150}
                                            dir="rtl"
                                        />
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default TeacherCommentsPanelContent;
