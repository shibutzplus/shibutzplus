import React from "react";
import styles from "./AnnualRow.module.css";
import { DAYS_OF_WORK_WEEK } from "@/utils/time";
import AnnualCell from "../AnnualCell/AnnualCell";
import { WeeklySchedule } from "@/models/types/annualSchedule";
import { SubjectType } from "@/models/types/subjects";
import { TeacherType } from "@/models/types/teachers";
import { ClassType } from "@/models/types/classes";
import { HourRowColor } from "@/style/tableColors";

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
    selectedTeacherId: string;
};

const AnnualRow: React.FC<AnnualRowProps> = (props) => {
    const { hour, selectedTeacherId } = props;

    return (
        <tr>
            <td
                className={styles.hourCell}
                style={{ backgroundColor: HourRowColor }}
            >
                {hour}
            </td>
            {DAYS_OF_WORK_WEEK.map((day) => (
                <AnnualCell
                    key={`${day}-${hour}`}
                    day={day}
                    {...props}
                    selectedTeacherId={selectedTeacherId}
                />
            ))}
        </tr>
    );
};

export default AnnualRow;
