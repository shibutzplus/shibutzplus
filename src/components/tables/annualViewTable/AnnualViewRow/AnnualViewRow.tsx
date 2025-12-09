import React from "react";
import styles from "./AnnualViewRow.module.css";
import { DAYS_OF_WORK_WEEK } from "@/utils/time";
import AnnualViewCell from "@/components/tables/annualViewTable/AnnualViewCell/AnnualViewCell";
import { WeeklySchedule } from "@/models/types/annualSchedule";
import { SubjectType } from "@/models/types/subjects";
import { TeacherType } from "@/models/types/teachers";
import { ClassType } from "@/models/types/classes";

type AnnualViewRowProps = {
    hour: number;
    schedule: WeeklySchedule;
    selectedClassId: string;
    selectedTeacherId: string;
    subjects: SubjectType[];
    teachers: TeacherType[];
    classes: ClassType[];
    isDisabled: boolean;
};

const AnnualViewRow: React.FC<AnnualViewRowProps> = (props) => {
    const { hour } = props;

    return (
        <tr className={styles.annualRow}>
            <td className={styles.hoursColumn}>
                <div className={styles.hourCell}>{hour}</div>
            </td>
            <td className={styles.emptyCell}></td>
            {DAYS_OF_WORK_WEEK.map((day) => (
                <AnnualViewCell
                    key={`${day}-${hour}`}
                    day={day}
                    {...props}
                />
            ))}
        </tr>
    );
};

export default AnnualViewRow;
