import React from "react";
import styles from "./PreviewTeacherRow.module.css";
import PreviewTeacherDetailsCell from "../PreviewTeacherDetailsCell/PreviewTeacherDetailsCell";
import PreviewTeacherInstructionsCell from "../PreviewTeacherInstructionsCell/PreviewTeacherInstructionsCell";
import { TeacherScheduleType } from "@/models/types/portalSchedule";
import { TeacherType } from "@/models/types/teachers";

type PreviewTeacherRowProps = {
    hour: number;
    row?: TeacherScheduleType;
    teacher: TeacherType;
    selectedDate: string;
};

const PreviewTeacherRow: React.FC<PreviewTeacherRowProps> = ({
    hour,
    row,
    teacher,
    selectedDate,
}) => {
    return (
        <tr className={styles.teacherRow}>
            <td className={styles.hoursColumn}>
                <div className={styles.hourCell}>{hour}</div>
            </td>
            <td className={styles.emptyCell}></td>
            <td className={styles.scheduleCell}>
                <PreviewTeacherDetailsCell row={row} teacher={teacher} />
                <PreviewTeacherInstructionsCell
                    row={row}
                    teacher={teacher}
                    selectedDate={selectedDate}
                />
            </td>
        </tr>
    );
};

export default PreviewTeacherRow;
