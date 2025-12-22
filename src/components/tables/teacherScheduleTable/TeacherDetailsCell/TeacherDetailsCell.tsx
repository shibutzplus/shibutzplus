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
    const displayReplaceTeacher = () => {
        if (row?.issueTeacher) {
            if (teacher?.id === row?.issueTeacher?.id) {
                if (row?.subTeacher) return `${row?.subTeacher?.name}`;
                if (row?.event) return row?.event;
                return "";
            } else {
                return `במקום ${row?.issueTeacher?.name}`;
            }
        }
        return "";
    };

    return (
        <div className={`${row ? styles.cellContent : styles.emptyCell}`}>
            <div className={styles.classAndSubject}>
                {row?.classes?.map((c) => c.name).join(", ")}
                {row?.subject?.name &&
                    !row?.classes?.some((c) => c.activity) &&
                    ` | ${row.subject.name}`}
            </div>
            <div className={styles.subTeacher}>{displayReplaceTeacher()}</div>
        </div>
    );
};
export default TeacherDetailsCell;
