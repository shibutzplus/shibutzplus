import React from "react";
import styles from "./AnnualViewCell.module.css";
import { WeeklySchedule } from "@/models/types/annualSchedule";
import { SubjectType } from "@/models/types/subjects";
import { TeacherType } from "@/models/types/teachers";
import { ClassType } from "@/models/types/classes";

type AnnualViewCellProps = {
    day: string;
    hour: number;
    schedule: WeeklySchedule;
    selectedClassId: string;
    selectedTeacherId: string;
    subjects: SubjectType[];
    teachers: TeacherType[];
    classes: ClassType[];
};

const AnnualViewCell: React.FC<AnnualViewCellProps> = ({
    day,
    hour,
    schedule,
    selectedClassId,
    selectedTeacherId,
    subjects,
    teachers,
    classes,
}) => {
    // Determine which ID to use for looking up the schedule
    // If Class is selected, we use Class ID.
    // If only Teacher is selected, we use Teacher ID.
    const lookupId = selectedClassId || selectedTeacherId;

    if (!lookupId || !schedule[lookupId] || !schedule[lookupId][day] || !schedule[lookupId][day][hour]) {
        return (
            <td className={styles.scheduleCell}>
                <div className={`${styles.cellContent} ${styles.viewOnly}`}></div>
            </td>
        );
    }

    const cellData = schedule[lookupId][day][hour];
    const { teachers: teacherIds, subjects: subjectIds, classId } = cellData;

    // Helper to get names
    const getSubjectName = (id: string) => subjects.find((s) => s.id === id)?.name || "";
    const getTeacherName = (id: string) => teachers.find((t) => t.id === id)?.name || "";
    const getClassName = (id: string) => classes.find((c) => c.id === id)?.name || "";

    // Logic for display based on selection:
    // 1. Only Class Selected: Show Subject + Teacher
    // 2. Only Teacher Selected: Show Class + Subject
    // 3. Both Selected: Show Subject (only if teacher matches)

    let content = null;

    if (selectedClassId && !selectedTeacherId) {
        // Scenario 1: Only Class Selected -> Subject + Teacher
        content = (
            <>
                {subjectIds.map((sid, idx) => (
                    <div key={sid} className={styles.subject}>
                        {getSubjectName(sid)}
                    </div>
                ))}
                {teacherIds.map((tid, idx) => (
                    <div key={tid} className={styles.teacher}>
                        {getTeacherName(tid)}
                    </div>
                ))}
            </>
        );
    } else if (!selectedClassId && selectedTeacherId) {
        // Scenario 2: Only Teacher Selected -> Class + Subject
        content = (
            <>
                {classId && (
                    <div className={styles.class}>
                        {getClassName(classId)}
                    </div>
                )}
                {subjectIds.map((sid, idx) => (
                    <div key={sid} className={styles.subject}>
                        {getSubjectName(sid)}
                    </div>
                ))}
            </>
        );
    } else if (selectedClassId && selectedTeacherId) {
        // Scenario 3: Both Selected -> Subject (only if teacher is in this cell)
        // The schedule is populated by Class ID (from Context logic).
        // We need to check if the selected teacher is in this cell.
        const isTeacherInCell = teacherIds.includes(selectedTeacherId);

        if (isTeacherInCell) {
            content = (
                <>
                    {subjectIds.map((sid, idx) => (
                        <div key={sid} className={styles.subject} style={{ fontWeight: "normal" }}>
                            {getSubjectName(sid)}
                        </div>
                    ))}
                </>
            );
        }
    }

    return (
        <td className={styles.scheduleCell}>
            <div className={`${styles.cellContent} ${styles.viewOnly}`}>
                {content}
            </div>
        </td>
    );
};

export default AnnualViewCell;
