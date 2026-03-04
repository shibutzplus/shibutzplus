import React, { useMemo } from "react";
import styles from "./DailyAltViewClassesCell.module.css";
import { SubjectType } from "@/models/types/subjects";
import { TeacherType } from "@/models/types/teachers";
import { WeeklySchedule } from "@/models/types/annualSchedule";
import { ClassType } from "@/models/types/classes";

type DailyAltViewClassesCellProps = {
    day: string;
    hour: number;
    schedule: WeeklySchedule;
    selectedClassId: string;
    subjects: SubjectType[];
    teachers: TeacherType[];
    classes: ClassType[];
};

const DailyAltViewClassesCell: React.FC<DailyAltViewClassesCellProps> = ({
    day,
    hour,
    schedule,
    selectedClassId,
    subjects,
    teachers,
    classes,
}) => {
    const isActivity = classes.find((c) => c.id === selectedClassId)?.activity;

    const cellData = schedule[selectedClassId]?.[day]?.[hour];
    const teacherIds = cellData?.teachers || [];
    const subjectIds = cellData?.subjects || [];

    const selectedTeachers = useMemo(() => {
        return teacherIds
            .map((id) => teachers.find((t) => t.id === id))
            .filter(Boolean) as TeacherType[];
    }, [teacherIds, teachers]);

    const selectedSubjects = useMemo(() => {
        return subjectIds
            .map((id) => subjects.find((s) => s.id === id))
            .filter(Boolean) as SubjectType[];
    }, [subjectIds, subjects]);

    return (
        <td className={styles.scheduleCell}>
            <div className={styles.cellContent}>
                {selectedTeachers.length > 0 && (
                    <div className={styles.itemWrapper}>
                        {selectedTeachers.map((t) => (
                            <span key={t.id} className={`${styles.itemName} ${styles.bold}`}>
                                {t.name}
                            </span>
                        ))}
                    </div>
                )}

                {selectedSubjects.length > 0 && (
                    <div className={styles.itemWrapper}>
                        {selectedSubjects.map((s) => (
                            <span
                                key={s.id}
                                className={`${styles.itemName} ${isActivity ? styles.disabledText : ""}`}
                            >
                                {s.name}
                            </span>
                        ))}
                    </div>
                )}
            </div>
        </td>
    );
};

export default DailyAltViewClassesCell;
