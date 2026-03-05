import React from "react";
import styles from "./TeacherDailyChangesRow.module.css";
import TeacherDailyChangesDetailsCell from "../TeacherDailyChangesDetailsCell/TeacherDailyChangesDetailsCell";
import TeacherDailyChangesInstructionsCell from "../TeacherDailyChangesInstructionsCell/TeacherDailyChangesInstructionsCell";
import { TeacherScheduleType } from "@/models/types/portalSchedule";
import { TeacherType } from "@/models/types/teachers";

type TeacherDailyChangesRowProps = {
    hour: number;
    row?: TeacherScheduleType;
    teacher?: TeacherType;
    selectedDate: string;
};

const TeacherDailyChangesRow: React.FC<TeacherDailyChangesRowProps> = ({ hour, row, teacher, selectedDate }) => {
    return (
        <tr className={styles.teacherRow}>
            <td className={styles.emptyCell}></td>
            <td className={styles.hoursColumn}>
                <div className={styles.hourCell}>{hour}</div>
            </td>
            <td className={styles.emptyCell}></td>

            <td className={`${styles.scheduleDetailsCell} ${styles.desktopOnly}`}>
                <TeacherDailyChangesDetailsCell row={row} teacher={teacher} />
            </td>

            <td className={styles.scheduleInstructionsCell}>
                <div className={styles.mobileDetails}>
                    <TeacherDailyChangesDetailsCell row={row} teacher={teacher} />
                </div>
                <TeacherDailyChangesInstructionsCell row={row} teacher={teacher} selectedDate={selectedDate} />
            </td>
        </tr>
    );
};

export default TeacherDailyChangesRow;
