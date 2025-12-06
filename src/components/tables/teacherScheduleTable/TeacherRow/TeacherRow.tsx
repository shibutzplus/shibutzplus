import React from "react";
import styles from "./TeacherRow.module.css";
import TeacherDetailsCell from "../TeacherDetailsCell/TeacherDetailsCell";
import TeacherInstructionsCell from "../TeacherInstructionsCell/TeacherInstructionsCell";
import { TeacherScheduleType } from "@/models/types/portalSchedule";
import { TeacherType } from "@/models/types/teachers";

type TeacherRowProps = {
    hour: number;
    row?: TeacherScheduleType;
    teacher?: TeacherType;
    selectedDate: string;
    onlyMobile?: boolean;
};

const TeacherRow: React.FC<TeacherRowProps> = ({ hour, row, teacher, selectedDate, onlyMobile }) => {
    return (
        <tr className={styles.teacherRow}>
            <td className={styles.hoursColumn}>
                <div className={styles.hourCell}>{hour}</div>
            </td>
            <td className={styles.emptyCell}></td>

            {!onlyMobile && (
                <td className={`${styles.scheduleDetailsCell} ${styles.desktopOnly}`}>
                    <TeacherDetailsCell row={row} teacher={teacher} />
                </td>
            )}

            <td className={styles.scheduleInstructionsCell}>
                <div className={styles.mobileDetails} style={onlyMobile ? { display: "block" } : undefined}>
                    <TeacherDetailsCell row={row} teacher={teacher} />
                </div>
                <TeacherInstructionsCell row={row} teacher={teacher} selectedDate={selectedDate} />
            </td>
        </tr>
    );
};

export default TeacherRow;
