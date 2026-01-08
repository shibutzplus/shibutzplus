import React from "react";
import styles from "./AnnualViewCell.module.css";
import { WeeklySchedule } from "@/models/types/annualSchedule";
import { SubjectType } from "@/models/types/subjects";
import { TeacherType } from "@/models/types/teachers";
import { ClassType } from "@/models/types/classes";
import { getAnnualCellDisplayData } from "@/utils/annualCellDisplay";

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
    const isBothSelected = !!(selectedClassId && selectedTeacherId);

    if (!lookupId || !schedule[lookupId] || !schedule[lookupId][day] || !schedule[lookupId][day][hour]) {
        return (
            <td className={styles.scheduleCell}>
                <div className={`${styles.cellContent} ${styles.viewOnly}`}></div>
            </td>
        );
    }

    const cellData = schedule[lookupId][day][hour];
    // shared component logic
    const { subjectsText, secondaryText, shouldRender } = getAnnualCellDisplayData(
        cellData,
        selectedClassId,
        selectedTeacherId,
        subjects,
        teachers,
        classes
    );

    if (!shouldRender) {
        // Fallback similar to empty cell logic if not rendering
        return (
            <td className={styles.scheduleCell}>
                <div className={`${styles.cellContent} ${styles.viewOnly}`}></div>
            </td>
        );
    }

    const content = (
        <>
            {subjectsText && (
                <div className={styles.subject} style={isBothSelected ? { fontWeight: "normal" } : {}}>
                    {subjectsText}
                </div>
            )}
            {secondaryText && (
                <div className={selectedTeacherId ? styles.class : styles.teacher}>
                    {secondaryText}
                </div>
            )}
        </>
    );

    return (
        <td className={styles.scheduleCell}>
            <div className={`${styles.cellContent} ${styles.viewOnly}`}>
                {content}
            </div>
        </td>
    );
};

export default AnnualViewCell;
