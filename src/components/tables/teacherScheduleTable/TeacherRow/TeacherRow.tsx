import React from "react";
import styles from "./TeacherRow.module.css";
import TeacherDetailsCell from "../TeacherDetailsCell/TeacherDetailsCell";
import TeacherInstructionsCell from "../TeacherInstructionsCell/TeacherInstructionsCell";
import { TeacherScheduleType } from "@/models/types/portalSchedule";

type TeacherRowProps = {
    hour: number;
    row?: TeacherScheduleType;
};

const TeacherRow: React.FC<TeacherRowProps> = ({ hour, row }) => {
    return (
        <tr className={styles.teacherRow}>
            <td className={styles.hoursColumn}>
                <div className={styles.hourCell}>{hour}</div>
            </td>
            <td className={styles.emptyCell}></td>
            <TeacherDetailsCell row={row}/>
            <TeacherInstructionsCell row={row}/>
        </tr>
    );
};

export default TeacherRow;
