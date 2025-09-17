import React from "react";
import styles from "./ViewTeacherCell.module.css";
import { DailyScheduleType } from "@/models/types/dailySchedule";

type ViewTeacherCellProps = {
    cellData: DailyScheduleType;
};

const ViewTeacherCell: React.FC<ViewTeacherCellProps> = ({ cellData }) => {
    return (
        <div className={styles.teacherCell}>
            {cellData.class && <div className={styles.className}>{cellData.class.name}</div>}
            {cellData.subject && <div className={styles.subjectName}>{cellData.subject.name}</div>}
            {cellData.subTeacher ? (
                <div className={styles.subTeacherName}>מחליף: {cellData.subTeacher?.name}</div>
            ) : cellData.event ? (
                <div className={styles.subTeacherName}>{cellData.event}</div>
            ) : null}
        </div>
    );
};

export default ViewTeacherCell;
