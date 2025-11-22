import React from "react";
import styles from "./PreviewTeacherCell.module.css";
import { ColumnType, ColumnTypeValues, DailyScheduleCell } from "@/models/types/dailySchedule";
import EmptyCell from "@/components/ui/table/EmptyCell/EmptyCell";

type PreviewTeacherCellProps = {
    columnId: string;
    cell: DailyScheduleCell;
    type: ColumnType;
};
//TODO: what to put and missing text css
const PreviewTeacherCell: React.FC<PreviewTeacherCellProps> = ({ cell }) => {
    const classData = cell?.class;
    const subjectData = cell?.subject;
    const subTeacherData = cell?.subTeacher;
    const teacherText = cell?.event;
    const isMissingTeacher = cell?.headerCol?.type === ColumnTypeValues.missingTeacher;

    return (
        <div className={styles.cellContent}>
            {subTeacherData || teacherText || isMissingTeacher ? (
                <div className={styles.innerCellContent}>
                    <span>
                        {classData && classData.name}
                        {subjectData && " | " + subjectData.name}
                    </span>
                    {subTeacherData ? (
                        <div className={styles.subTeacherName}>מ"מ: {subTeacherData.name}</div>
                    ) : teacherText ? (
                        <div className={styles.subTeacherName}>{teacherText}</div>
                    ) : isMissingTeacher ? (
                        <div className={styles.missingSubTeacherName}>אין מילוי מקום</div>
                    ) : null}
                </div>
            ) : (
                <EmptyCell />
            )}
        </div>
    );
};

export default PreviewTeacherCell;

// if (
//     !cellData.subTeacher &&
//     !cellData.event &&
//     cellData.issueTeacherType !== ColumnTypeValues.missingTeacher
// ) {
//     return <div className={styles.teacherCell}></div>;
// }
// return (
//     <div className={styles.teacherCell}>
//         {cellData.class && <div className={styles.className}>{cellData.class.name}</div>}
//         {cellData.subject && <div className={styles.subjectName}>{cellData.subject.name}</div>}
//         {cellData.subTeacher ? (
//             <div className={styles.subTeacherName}>מ"מ: {cellData.subTeacher?.name}</div>
//         ) : cellData.event ? (
//             <div className={styles.subTeacherName}>{cellData.event}</div>
//         ) : cellData.issueTeacherType === ColumnTypeValues.missingTeacher ? (
//             <div className={styles.missingSubTeacherName}>אין מילוי מקום</div>
//         ) : null}
//     </div>
// );
