import React from "react";
import styles from "./AnnualRow.module.css";
import { DAYS_OF_WORK_WEEK } from "@/utils/time";
import AnnualCell from "../AnnualCell/AnnualCell";
import { WeeklySchedule, AnnualInputCellType } from "@/models/types/annualSchedule";
import { SubjectType } from "@/models/types/subjects";
import { TeacherType } from "@/models/types/teachers";
import { ClassType } from "@/models/types/classes";
import { SelectMethod } from "@/models/types/actions";

type AnnualRowProps = {
    hour: number;
    schedule: WeeklySchedule;
    selectedClassId: string;
    subjects: SubjectType[];
    teachers: TeacherType[];
    classes: ClassType[];
    isDisabled: boolean;
    onCreateSubject: (day: string, hour: number, value: string) => Promise<string | undefined>;
    onCreateTeacher: (day: string, hour: number, value: string) => Promise<string | undefined>;
    handleAddNewRow: (
        type: AnnualInputCellType,
        elementIds: string[],
        day: string,
        hour: number,
        method: SelectMethod,
        newElementObj?: TeacherType | SubjectType,
    ) => Promise<void>;
    isTeacherView?: boolean;
};

const AnnualRow: React.FC<AnnualRowProps> = (props) => {
    const { hour } = props;

    return (
        <tr className={styles.annualRow}>
            <td className={styles.hoursColumn}>
                <div className={styles.hourCell}>{hour}</div>
            </td>
            <td className={styles.emptyCell}></td>
            {DAYS_OF_WORK_WEEK.map((day) => (
                <AnnualCell
                    key={`${day}-${hour}`}
                    day={day}
                    {...props}
                />
            ))}
        </tr>
    );
};

export default AnnualRow;
