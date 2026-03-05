import React from "react";
import styles from "./MngrAnnualViewRow.module.css";
import { DAYS_OF_WORK_WEEK } from "@/utils/time";
import MngrAnnualViewCell from "../MngrAnnualViewCell/MngrAnnualViewCell";
import { WeeklySchedule } from "@/models/types/annualSchedule";
import { SubjectType } from "@/models/types/subjects";
import { TeacherType } from "@/models/types/teachers";
import { ClassType } from "@/models/types/classes";

type MngrAnnualViewRowProps = {
    hour: number;
    schedule: WeeklySchedule;
    selectedClassId: string;
    selectedTeacherId: string;
    subjects: SubjectType[];
    teachers: TeacherType[];
    classes: ClassType[];
    isDisabled: boolean;
};

const MngrAnnualViewRow: React.FC<MngrAnnualViewRowProps> = (props) => {
    const { hour } = props;

    return (
        <tr className={styles.annualRow}>
            <td className={styles.hoursColumn}>
                <div className={styles.hourCell}>{hour}</div>
            </td>
            <td className={styles.emptyCell}></td>
            {DAYS_OF_WORK_WEEK.map((day) => (
                <MngrAnnualViewCell
                    key={`${day}-${hour}`}
                    day={day}
                    {...props}
                />
            ))}
        </tr>
    );
};

export default MngrAnnualViewRow;
