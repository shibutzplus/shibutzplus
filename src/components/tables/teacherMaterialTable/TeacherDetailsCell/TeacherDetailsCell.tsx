"use client";

import React from "react";
import styles from "./TeacherDetailsCell.module.css";
import { TeacherScheduleType } from "@/models/types/portalSchedule";
import { TeacherType } from "@/models/types/teachers";

type TeacherDetailsCellProps = {
    row?: TeacherScheduleType;
    teacher?: TeacherType;
};

const TeacherDetailsCell: React.FC<TeacherDetailsCellProps> = ({ row, teacher }) => {
    const getReplaceText = (r?: TeacherScheduleType) => {
        if (!r?.issueTeacher) return "";
        if (teacher?.id === r.issueTeacher?.id) {
            if (r.subTeacher) return `מוחלף ע"י ${r.subTeacher.name}`;
            if (r.event) return r.event;
            return "";
        } else {
            return `מחליף את ${r.issueTeacher.name}`;
        }
    };

    const primaryText = getReplaceText(row);
    const secondaryText = getReplaceText(row?.secondary);
    const isDouble = !!(primaryText && secondaryText);

    const displayReplaceTeacher = () => {
        if (isDouble) {
            const texts = [primaryText, secondaryText].sort((a, b) => {
                if (a.startsWith("מחליף את")) return -1;
                return 1;
            });

            return (
                <>
                    <div>{texts[0]}</div>
                    <div>{texts[1]}</div>
                </>
            );
        }
        const text = primaryText || secondaryText;
        if (text?.startsWith("מוחלף ע\"י ")) {
            return text.replace("מוחלף ע\"י ", "");
        }
        return text;
    };

    return (
        <div className={`${row ? styles.cellContent : styles.emptyCell}`}>
            <div className={styles.classAndSubject}>
                {row?.classes?.map((c) => c.name).join(", ")}
                {row?.subject?.name &&
                    !row?.classes?.some((c) => c.activity) &&
                    ` | ${row.subject.name}`}
            </div>
            <div className={`${styles.subTeacher} ${isDouble ? styles.doubleRow : ""}`}>
                {displayReplaceTeacher()}
            </div>
        </div>
    );
};
export default TeacherDetailsCell;
