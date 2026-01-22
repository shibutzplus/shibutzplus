"use client";

import React from "react";
import styles from "./TeacherDetailsCell.module.css";
import { TeacherScheduleType } from "@/models/types/portalSchedule";
import { TeacherType } from "@/models/types/teachers";
import { ColumnTypeValues } from "@/models/types/dailySchedule";

import { getCellDisplayData } from "@/utils/dailyCellDisplay";

type TeacherDetailsCellProps = {
    row?: TeacherScheduleType;
    teacher?: TeacherType;
};

const TeacherDetailsCell: React.FC<TeacherDetailsCellProps> = ({ row, teacher }) => {
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
            const texts = [primary, secondary].sort((a, _b) => {
                if (a.type === "replacing") return 1;
                return -1;
            });

            const firstLine = texts[0].type === "replaced"
                ? <>{texts[0].text} <span className={styles.secondaryRow}>במקומי</span></>
                : texts[0].text;
            const secondLine = texts[1].type === "replacing"
                ? <>אני במקום <span className={styles.bold}>{texts[1].text}</span></>
                : texts[1].text;

            return (
                <>
                    <div>{firstLine}</div>
                    <div className={styles.secondaryRow}>{secondLine}</div>
                </>
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
export default TeacherDetailsCell;
