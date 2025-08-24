import React from "react";
import styles from "./AnnualRow.module.css";
import { DAYS_OF_WORK_WEEK } from "@/utils/time";
import AnnualCell from "../AnnualCell/AnnualCell";
import { WeeklySchedule } from "@/models/types/annualSchedule";
import { SubjectType } from "@/models/types/subjects";
import { TeacherType } from "@/models/types/teachers";
import { ClassType } from "@/models/types/classes";

type AnnualRowProps = {
    hour: number;
    schedule: WeeklySchedule;
    selectedClassId: string;
    subjects: SubjectType[];
    teachers: TeacherType[];
    classes: ClassType[];
    isDisabled: boolean;
    onSubjectChange: (day: string, hour: number, value: string[], removed?: string) => Promise<void>;
    onTeacherChange: (day: string, hour: number, value: string[], removed?: string) => Promise<void>;
    onCreateSubject: (day: string, hour: number, value: string) => Promise<string | undefined>;
    onCreateTeacher: (day: string, hour: number, value: string) => Promise<string | undefined>;
};

const AnnualRow: React.FC<AnnualRowProps> = (props) => {
    return (
        <tr>
            <td className={styles.hourCell}>{props.hour}</td>
            {DAYS_OF_WORK_WEEK.map((day) => (
                <AnnualCell key={`${day}-${props.hour}`} day={day} {...props} />
            ))}
        </tr>
    );
};

export default AnnualRow;
