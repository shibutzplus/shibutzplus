import React from "react";
import styles from "./ReadOnlyTeacherCell.module.css";
import { DailyScheduleType } from "@/models/types/dailySchedule";

type ReadOnlyTeacherCellProps = {
    cellData: DailyScheduleType;
};

const ReadOnlyTeacherCell: React.FC<ReadOnlyTeacherCellProps> = ({ cellData }) => {
    return (
        <div className={styles.teacherCell}>
            {cellData.class && <div className={styles.className}>{cellData.class.name}</div>}
            {cellData.subject && <div className={styles.subjectName}>{cellData.subject.name}</div>}
            {cellData.subTeacher && (
                <div className={styles.subTeacherName}>{cellData.subTeacher.name}</div>
            )}
        </div>
    );
};

export default ReadOnlyTeacherCell;
