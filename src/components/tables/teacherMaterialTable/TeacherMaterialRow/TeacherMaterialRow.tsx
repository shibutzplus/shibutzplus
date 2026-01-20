import React from "react";
import styles from "./TeacherMaterialRow.module.css";
import TeacherDetailsCell from "../TeacherDetailsCell/TeacherDetailsCell";
import TeacherInstructionsCell from "../TeacherInstructionsCell/TeacherInstructionsCell";
import { TeacherScheduleType } from "@/models/types/portalSchedule";
import { TeacherType } from "@/models/types/teachers";

type TeacherMaterialRowProps = {
    hour: number;
    row?: TeacherScheduleType;
    teacher?: TeacherType;
    selectedDate: string;
};

const TeacherMaterialRow: React.FC<TeacherMaterialRowProps> = ({ hour, row, teacher, selectedDate }) => {
    return (
        <tr className={styles.teacherRow}>
            <td className={styles.emptyCell}></td>
            <td className={styles.hoursColumn}>
                <div className={styles.hourCell}>{hour}</div>
            </td>
            <td className={styles.emptyCell}></td>

            <td className={`${styles.scheduleDetailsCell} ${styles.desktopOnly}`}>
                <TeacherDetailsCell row={row} teacher={teacher} />
            </td>

            <td className={styles.scheduleInstructionsCell}>
                <div className={styles.mobileDetails}>
                    <TeacherDetailsCell row={row} teacher={teacher} />
                </div>
                <TeacherInstructionsCell row={row} teacher={teacher} selectedDate={selectedDate} />
            </td>
        </tr>
    );
};

export default TeacherMaterialRow;
