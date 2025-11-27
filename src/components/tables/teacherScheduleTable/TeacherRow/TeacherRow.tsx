import React from "react";
import styles from "./TeacherRow.module.css";
import TeacherDetailsCell from "../TeacherDetailsCell/TeacherDetailsCell";
import TeacherInstructionsCell from "../TeacherInstructionsCell/TeacherInstructionsCell";
import { TeacherScheduleType } from "@/models/types/portalSchedule";
import { useMobileSize } from "@/hooks/browser/useMobileSize";
import { TeacherType } from "@/models/types/teachers";

type TeacherRowProps = {
    hour: number;
    row?: TeacherScheduleType;
    teacher?: TeacherType;
    selectedDate: string;
};

const TeacherRow: React.FC<TeacherRowProps> = ({ hour, row, teacher, selectedDate }) => {
    const isMobile = useMobileSize();

    let scheduleCell = (
        <>
            <td className={styles.scheduleDetailsCell}>
                <TeacherDetailsCell row={row} teacher={teacher} />
            </td>
            <td className={styles.scheduleInstructionsCell}>
                <TeacherInstructionsCell row={row} teacher={teacher} selectedDate={selectedDate} />
            </td>
        </>
    );
    if (isMobile)
        scheduleCell = (
            <td className={styles.scheduleCell}>
                <TeacherDetailsCell row={row} teacher={teacher} />
                <TeacherInstructionsCell row={row} teacher={teacher} selectedDate={selectedDate} />
            </td>
        );

    return (
        <tr className={styles.teacherRow}>
            <td className={styles.hoursColumn}>
                <div className={styles.hourCell}>{hour}</div>
            </td>
            <td className={styles.emptyCell}></td>
            {scheduleCell}
        </tr>
    );
};

export default TeacherRow;
