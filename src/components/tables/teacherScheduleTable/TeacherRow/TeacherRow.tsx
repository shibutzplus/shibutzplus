import React from "react";
import styles from "./TeacherRow.module.css";
import TeacherDetailsCell from "../TeacherDetailsCell/TeacherDetailsCell";
import TeacherInstructionsCell from "../TeacherInstructionsCell/TeacherInstructionsCell";
import { TeacherScheduleType } from "@/models/types/portalSchedule";
import { useMobileSize } from "@/hooks/browser/useMobileSize";

type TeacherRowProps = {
    hour: number;
    row?: TeacherScheduleType;
};

const TeacherRow: React.FC<TeacherRowProps> = ({ hour, row }) => {
    const isMobile = useMobileSize();

    let scheduleCell = (
        <>
            <td className={styles.scheduleDetailsCell}>
                <TeacherDetailsCell row={row} />
            </td>
            <td className={styles.scheduleInstructionsCell}>
                <TeacherInstructionsCell row={row} />
            </td>
        </>
    );
    if (isMobile)
        scheduleCell = (
            <td className={styles.scheduleCell}>
                <TeacherDetailsCell row={row} />
                <TeacherInstructionsCell row={row} />
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
