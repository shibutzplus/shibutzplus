import React, { useMemo } from "react";
import styles from "./AnnualCell.module.css";
import DynamicInputSelect from "@/components/ui/InputSelect/DynamicInputSelect";
import { createSelectOptions, sortByHebrewName } from "@/utils/format";
import { SubjectType } from "@/models/types/subjects";
import { TeacherType } from "@/models/types/teachers";
import { WeeklySchedule } from "@/models/types/annualSchedule";
import { sortTeachersForSchedule } from "@/utils/teachers";
import DynamicInputGroupSelect from "@/components/ui/InputGroupSelect/DynamicInputGroupSelect";
import { ClassType } from "@/models/types/classes";
import { RiDeleteBin6Line } from "react-icons/ri";

type AnnualCellProps = {
    day: string;
    hour: number;
    schedule: WeeklySchedule;
    selectedClassId: string;
    subjects: SubjectType[];
    teachers: TeacherType[];
    classes: ClassType[];
    isDisabled: boolean;
    onSubjectChange: (day: string, hour: number, value: string) => Promise<void>;
    onTeacherChange: (day: string, hour: number, value: string) => Promise<void>;
    onCreateSubject: (day: string, hour: number, value: string) => Promise<string | undefined>;
    onCreateTeacher: (day: string, hour: number, value: string) => Promise<string | undefined>;
};

const AnnualCell: React.FC<AnnualCellProps> = ({
    day,
    hour,
    schedule,
    selectedClassId,
    subjects,
    teachers,
    classes,
    isDisabled,
    onSubjectChange,
    onTeacherChange,
    onCreateSubject,
    onCreateTeacher,
}) => {
    const sortedTeacherOptions = useMemo(
        () =>
            sortTeachersForSchedule(
                teachers || [],
                classes || [],
                schedule,
                selectedClassId,
                day,
                hour,
            ),
        [teachers, classes, schedule, selectedClassId, day, hour],
    );
    return (
        <td className={styles.scheduleCell}>
            {/* <div className={styles.deleteBtn}>
                <RiDeleteBin6Line size={12} />
            </div> */}
            <div className={styles.cellContent}>
                <DynamicInputSelect
                    placeholder="מקצוע"
                    options={createSelectOptions<SubjectType>(sortByHebrewName(subjects || []))}
                    value={schedule[selectedClassId]?.[day]?.[hour]?.subject || ""}
                    onChange={(value: string) => onSubjectChange(day, hour, value)}
                    onCreate={(value: string) => onCreateSubject(day, hour, value)}
                    isSearchable
                    allowAddNew
                    isDisabled={isDisabled}
                />
                <DynamicInputGroupSelect
                    placeholder="מורה"
                    options={sortedTeacherOptions}
                    value={schedule[selectedClassId]?.[day]?.[hour]?.teacher || ""}
                    onChange={(value: string) => onTeacherChange(day, hour, value)}
                    isSearchable
                    allowAddNew
                    onCreate={(v: string) => {
                        return onCreateTeacher(day, hour, v);
                    }}
                    isDisabled={isDisabled}
                />
            </div>
        </td>
    );
};

export default AnnualCell;
