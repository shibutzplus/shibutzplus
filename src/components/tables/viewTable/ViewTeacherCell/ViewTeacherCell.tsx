import React from "react";
import styles from "./ViewTeacherCell.module.css";
import { ColumnTypeValues, DailyScheduleType } from "@/models/types/dailySchedule";
import { usePathname } from "next/navigation";

type ViewTeacherCellProps = {
    cellData: DailyScheduleType;
};

const ViewTeacherCell: React.FC<ViewTeacherCellProps> = ({ cellData }) => {
    const pathname = usePathname();
    const isTeacherPortal = pathname.startsWith("/publish-portal");

    // If from teacher portal and no subTeacher/event and not missingTeacher → return empty cell
    if (
        isTeacherPortal &&
        !cellData.subTeacher &&
        !cellData.event &&
        cellData.issueTeacherType !== ColumnTypeValues.missingTeacher
    ) {
        return <div className={styles.teacherCell}></div>;
    }


    return (
        <div className={styles.teacherCell}>
            {cellData.class && <div className={styles.className}>{cellData.class.name}</div>}
            {cellData.subject && <div className={styles.subjectName}>{cellData.subject.name}</div>}
            {cellData.subTeacher ? (
                <div className={styles.subTeacherName}>מ"מ: {cellData.subTeacher?.name}</div>
            ) : cellData.event ? (
                <div className={styles.subTeacherName}>{cellData.event}</div>
            ) : (
                <div className={styles.missingSubTeacherName}>אין מילוי מקום</div>
            )}
        </div>
    );
};

export default ViewTeacherCell;
