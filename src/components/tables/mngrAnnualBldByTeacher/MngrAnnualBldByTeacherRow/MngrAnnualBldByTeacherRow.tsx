import React from "react";
import styles from "./MngrAnnualBldByTeacherRow.module.css";
import { DAYS_OF_WORK_WEEK } from "@/utils/time";
import MngrAnnualBldByTeacherCell from "../MngrAnnualBldByTeacherCell/MngrAnnualBldByTeacherCell";
import { WeeklySchedule, AnnualInputCellType } from "@/models/types/annualSchedule";
import { SubjectType } from "@/models/types/subjects";
import { TeacherType } from "@/models/types/teachers";
import { ClassType } from "@/models/types/classes";
import { SelectMethod } from "@/models/types/actions";

type MngrAnnualBldByTeacherRowProps = {
    hour: number;
    schedule: WeeklySchedule;
    selectedTeacherId: string;
    subjects: SubjectType[];
    teachers: TeacherType[];
    classes: ClassType[];
    isDisabled: boolean;
    handleScheduleUpdate: (
        type: AnnualInputCellType,
        elementIds: string[],
        day: string,
        hour: number,
        method: SelectMethod,
        newElementObj?: TeacherType | SubjectType,
    ) => Promise<void>;
    isTeacherView?: boolean;
};

const MngrAnnualBldByTeacherRow: React.FC<MngrAnnualBldByTeacherRowProps> = (props) => {
    const { hour } = props;

    return (
        <tr className={styles.annualRow}>
            <td className={styles.hoursColumn}>
                <div className={styles.hourCell}>{hour}</div>
            </td>
            <td className={styles.emptyCell}></td>
            {DAYS_OF_WORK_WEEK.map((day) => (
                <MngrAnnualBldByTeacherCell key={`${day}-${hour}`} day={day} {...props} />
            ))}
        </tr>
    );
};

export default MngrAnnualBldByTeacherRow;
