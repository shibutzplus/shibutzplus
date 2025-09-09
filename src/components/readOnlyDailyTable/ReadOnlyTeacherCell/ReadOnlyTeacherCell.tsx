import React from "react";
import styles from "./ReadOnlyTeacherCell.module.css";
import { DailyScheduleType } from "@/models/types/dailySchedule";

type ReadOnlyTeacherCellProps = {
    cellData: DailyScheduleType;
};

const ReadOnlyTeacherCell: React.FC<ReadOnlyTeacherCellProps> = ({ cellData }) => {
    const hasThirdRow = !!cellData.subTeacher || !!cellData.event;

    return (
        <div className={styles.teacherCell}>
            {cellData.class && (
                <div className={`${styles.className} ${!hasThirdRow ? styles.faded : ""}`}>
                    {cellData.class.name}
                </div>
            )}
            {cellData.subject && (
                <div className={`${styles.subjectName} ${!hasThirdRow ? styles.faded : ""}`}>
                    {cellData.subject.name}
                </div>
            )}
            {cellData.subTeacher ? (
                <div className={styles.subTeacherName}>מחליף: {cellData.subTeacher?.name}</div>
            ) : cellData.event ? (
                <div className={styles.subTeacherName}>{cellData.event}</div>
            ) : null}
        </div>
    );
};



export default ReadOnlyTeacherCell;
