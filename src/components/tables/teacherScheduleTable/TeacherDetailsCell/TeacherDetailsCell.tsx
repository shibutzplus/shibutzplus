"use client";

import React from "react";
import styles from "./TeacherDetailsCell.module.css";
import { TeacherScheduleType } from "@/models/types/portalSchedule";
import { usePortalContext } from "@/context/PortalContext";

type TeacherDetailsCellProps = {
    row?: TeacherScheduleType;
};

const TeacherDetailsCell: React.FC<TeacherDetailsCellProps> = ({ row }) => {
    const { teacher } = usePortalContext();
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
        <td className={styles.scheduleCell}>
            <div className={`${row ? styles.cellContent : styles.emptyCell}`}>
                <div className={styles.classAndSubject}>
                    {row?.class?.name && row?.subject?.name
                        ? `${row.class.name} | ${row.subject.name}`
                        : ""}
                </div>
                <div className={styles.subTeacher}>{displayReplaceTeacher()}</div>
            </div>
        </td>
    );
};
export default TeacherDetailsCell;
