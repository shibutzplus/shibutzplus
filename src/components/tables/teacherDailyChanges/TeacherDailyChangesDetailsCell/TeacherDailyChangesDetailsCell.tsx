"use client";

import React from "react";
import { TeacherScheduleType } from "@/models/types/portalSchedule";
import { TeacherType } from "@/models/types/teachers";
import { ColumnTypeValues } from "@/models/types/dailySchedule";
import { getCellDisplayData } from "@/utils/dailyCellDisplay";
import Icons from "@/style/icons";
import styles from "./TeacherDailyChangesDetailsCell.module.css";
import { successToast } from "@/lib/toast";

type TeacherDailyChangesDetailsCellProps = {
    row?: TeacherScheduleType;
    teacher?: TeacherType;
};

const TeacherDailyChangesDetailsCell: React.FC<TeacherDailyChangesDetailsCellProps> = ({ row, teacher }) => {
    const getReplaceText = (r?: TeacherScheduleType) => {
        if (!r?.originalTeacher) return null;
        if (teacher?.id === r.originalTeacher?.id) {
            if (r.subTeacher) return { text: r.subTeacher.name?.trim(), type: "replaced" };
            if (r.event) return { text: r.event?.trim(), type: "replaced" };
            return null;
        } else {
            return {
                text: r.originalTeacher.name?.trim(),
                type: "replacing",
            };
        }
    };

    const primary = getReplaceText(row);
    const secondary = getReplaceText(row?.secondary);
    const isDouble = !!(primary && secondary);
    const hasSub = !!(primary || secondary);

    const displayRow = secondary?.type === "replaced" && row?.secondary ? row.secondary : row;

    const displayReplaceTeacher = () => {

        if (isDouble && primary && secondary) {
            const replacingItem = primary.type === "replacing" ? primary : secondary;
            const replacedItem = primary.type === "replaced" ? primary : secondary;

            const replacingRow = primary.type === "replacing" ? row : row?.secondary;
            const replacingClasses = replacingRow?.classes?.map((cls) => cls.name).join(", ");

            const replacingText = <span className={styles.replacingText}>אני במקום <span>{replacingItem.text}</span>{replacingClasses ? ` (${replacingClasses})` : ""}</span>;
            const replacedText = <span className={styles.replacedText}>{replacedItem.text} <span>במקומי</span></span>;

            return (
                <div className={styles.doubleRow}>
                    {replacingText}, {replacedText}
                </div>
            );
        }
        const item = primary || secondary;
        if (item?.type === "replacing") {
            return `במקום ${item.text}`;
        }
        if (item?.type === "replaced") {
            return <span className={styles.subName}>{item.text}</span>;
        }
        return item?.text;
    };

    const { text: initialText, isActivity } = getCellDisplayData(displayRow as any, ColumnTypeValues.missingTeacher /* FFU */);
    let displayText = initialText;

    // If this is a regular schedule item - not a change/substitution, display the class and subject in grayed color
    if (row?.isRegular) {
        const classesData = row.classes;
        const subjectData = row.subject;
        if (classesData?.length) {
            const classNames = classesData.map((cls) => cls.name).join(", ");
            const subjectName = subjectData?.name || "";
            const sameAsSubject = subjectName && classNames === subjectName;
            displayText = classNames + (subjectData && !sameAsSubject ? ` (${subjectData.name})` : "");
        }
    }

    return (
        <div className={`${row ? styles.cellContent : styles.emptyCell}`}>
            {row?.comment && (
                <span
                    className={styles.commentIcon}
                    title={row.comment}
                    onClick={() => successToast(row.comment!)}
                    style={{ cursor: "pointer" }}
                >
                    <Icons.messageSquareSolid size={15} />
                </span>
            )}
            <div className={styles.combinedContent}>
                <span className={`${styles.classAndSubject} ${isActivity ? styles.activityText : ""} ${hasSub ? styles.hasSub : ""} ${row?.isRegular ? styles.regularText : ""}`}>
                    {displayText}
                </span>
                <span className={`${styles.subTeacher} ${isDouble ? styles.doubleRow : ""}`}>
                    {displayReplaceTeacher()}
                </span>
            </div>
        </div >
    );
};
export default TeacherDailyChangesDetailsCell;
