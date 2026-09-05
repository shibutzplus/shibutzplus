//
//  Used in CommonDailySchoolTable (Public Portal and Manager History).
//  Renders a single cell content in the daily changes PER CLASS view.
//

import React from "react";
import styles from "../CommonDailySchoolTeacherCell/CommonDailySchoolTeacherCell.module.css";
import EmptyCell from "@/components/ui/table/EmptyCell/EmptyCell";
import { ClassCellChangeEntry } from "@/utils/dailyClassSchedule";

type CommonDailySchoolClassCellProps = {
    entries?: ClassCellChangeEntry[];
};

const CommonDailySchoolClassCell: React.FC<CommonDailySchoolClassCellProps> = ({
    entries = [],
}) => {
    if (!entries || entries.length === 0) {
        return (
            <div className={styles.cellContent}>
                <EmptyCell />
            </div>
        );
    }

    const teacherName = entries
        .map((e) => e.teacherName)
        .filter(Boolean)
        .join(" / ");

    const replacedTeachers = Array.from(
        new Set(
            entries
                .filter((e) => e.originalTeacherName && e.originalTeacherName !== e.teacherName)
                .map((e) => e.originalTeacherName!.trim())
                .filter(Boolean)
        )
    );
    const replacedTeacherText =
        replacedTeachers.length > 0
            ? replacedTeachers.map((name) => `במקום ${name}`).join(" / ")
            : "";

    const subjectName = entries
        .map((e) => e.subjectName)
        .filter(Boolean)
        .join(" / ");
    const isMissing = entries.some((e) => e.isMissing || e.teacherName === "אין ממלא מקום");

    return (
        <div className={styles.cellContent}>
            <div className={styles.innerCellContent} style={{ gap: "4px", justifyContent: "center" }}>
                {teacherName && (
                    <div
                        className={
                            isMissing
                                ? styles.missingSubTeacherName
                                : styles.subTeacherName
                        }
                    >
                        {teacherName}
                    </div>
                )}
                {replacedTeacherText && (
                    <span className={styles.detailText}>
                        {replacedTeacherText}
                    </span>
                )}
                {subjectName && (
                    <span className={styles.detailText}>
                        {subjectName}
                    </span>
                )}
            </div>
        </div>
    );
};

export default CommonDailySchoolClassCell;
