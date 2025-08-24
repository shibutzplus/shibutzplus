import React, { useMemo } from "react";
import styles from "./AnnualCell.module.css";
import { createSelectOptions, sortByHebrewName } from "@/utils/format";
import { SubjectType } from "@/models/types/subjects";
import { TeacherType } from "@/models/types/teachers";
import { WeeklySchedule } from "@/models/types/annualSchedule";
import { sortTeachersForSchedule } from "@/utils/teachers";
import { ClassType } from "@/models/types/classes";
import DynamicInputMultiGroupSelect from "@/components/ui/select/InputMultiGroupSelect/DynamicInputMultiGroupSelect";
import DynamicInputMultiSelect from "@/components/ui/select/InputMultiSelect/DynamicInputMultiSelect";

type AnnualCellProps = {
    day: string;
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

    const handleSubjectChange = (values: string[], removed?: string) => {
        onSubjectChange(day, hour, values, removed);
    };

    const handleTeacherChange = (values: string[], removed?: string) => {
        onTeacherChange(day, hour, values, removed);
    };

    return (
        <td className={styles.scheduleCell}>
            {/* <div className={styles.deleteBtn}>
                <RiDeleteBin6Line size={12} />
            </div> */}
            <div className={styles.cellContent}>
                <DynamicInputMultiSelect
                    placeholder="מקצוע"
                    options={createSelectOptions<SubjectType>(sortByHebrewName(subjects || []))}
                    value={schedule[selectedClassId]?.[day]?.[hour]?.subjects ?? []}
                    onChange={handleSubjectChange}
                    onCreate={(value: string) => onCreateSubject(day, hour, value)}
                    isSearchable
                    allowAddNew
                    isDisabled={isDisabled}
                />
                <DynamicInputMultiGroupSelect
                    placeholder="מורה"
                    options={sortedTeacherOptions}
                    value={schedule[selectedClassId]?.[day]?.[hour]?.teachers ?? []}
                    onChange={handleTeacherChange}
                    isSearchable
                    allowAddNew
                    onCreate={(value: string) => onCreateTeacher(day, hour, value)}
                    isDisabled={isDisabled}
                />
            </div>
        </td>
    );
};

export default AnnualCell;
