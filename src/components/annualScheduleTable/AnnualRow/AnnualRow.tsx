"use client";

import React from "react";
import styles from "./AnnualRow.module.css";
import { DAYS_OF_WEEK } from "@/utils/time";
import AnnualScheduleCell from "../AnnualCell/AnnualCell";
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
    onSubjectChange: (day: string, hour: number, value: string) => Promise<void>;
    onTeacherChange: (day: string, hour: number, value: string) => Promise<void>;
    onCreateSubject: (day: string, hour: number, value: string) => Promise<string | undefined>;
    onCreateTeacher: (day: string, hour: number, value: string) => Promise<string | undefined>;
};

const AnnualRow: React.FC<AnnualRowProps> = ({
    hour,
    schedule,
    selectedClassId,
    subjects,
    teachers,
    classes,
    onSubjectChange,
    onTeacherChange,
    onCreateSubject,
    onCreateTeacher,
}) => {
    return (
        <tr>
            <td className={styles.hourCell}>{hour}</td>
            {DAYS_OF_WEEK.map((day) => (
                <AnnualScheduleCell
                    key={`${day}-${hour}`}
                    day={day}
                    hour={hour}
                    schedule={schedule}
                    selectedClassId={selectedClassId}
                    subjects={subjects}
                    teachers={teachers}
                    classes={classes}
                    onSubjectChange={onSubjectChange}
                    onTeacherChange={onTeacherChange}
                    onCreateSubject={onCreateSubject}
                    onCreateTeacher={onCreateTeacher}
                />
            ))}
        </tr>
    );
};

export default AnnualRow;
