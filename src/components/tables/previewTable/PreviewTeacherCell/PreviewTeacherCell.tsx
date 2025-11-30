import React from "react";
import styles from "./PreviewTeacherCell.module.css";
import { ColumnType, ColumnTypeValues, DailyScheduleCell } from "@/models/types/dailySchedule";
import EmptyCell from "@/components/ui/table/EmptyCell/EmptyCell";

type PreviewTeacherCellProps = {
    columnId: string;
    cell: DailyScheduleCell;
    type: ColumnType;
};

const PreviewTeacherCell: React.FC<PreviewTeacherCellProps> = ({ cell }) => {
    const classData = cell?.class;
    const subjectData = cell?.subject;
    const subTeacherData = cell?.subTeacher;
    const teacherText = cell?.event;
    const isMissingTeacher = cell?.headerCol?.type === ColumnTypeValues.missingTeacher;

    // If there is no sub teacher and no event, and there is also no class/subject to show
    // return an empty cell.
    if (
        !subTeacherData &&
        !teacherText &&
        (!isMissingTeacher || (!classData && !subjectData))
    ) {
        return (
            <div className={styles.cellContent}>
                <EmptyCell />
            </div>
        );
    }

    return (
        <div className={styles.cellContent}>
            <div className={styles.innerCellContent}>
                <span>
                    {classData && classData.name}
                    {subjectData && !classData?.activity && " | " + subjectData.name}
                </span>
                {subTeacherData ? (
                    <div className={styles.subTeacherName}>מ"מ: {subTeacherData.name}</div>
                ) : teacherText ? (
                    <div className={styles.subTeacherName}>{teacherText}</div>
                ) : isMissingTeacher && !classData?.activity ? (
                    <div className={styles.missingSubTeacherName}>אין מילוי מקום</div>
                ) : null}
            </div>
        </div>
    );
};

export default PreviewTeacherCell;
