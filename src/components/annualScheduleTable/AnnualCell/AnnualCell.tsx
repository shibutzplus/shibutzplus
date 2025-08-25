import React, { useMemo } from "react";
import styles from "./AnnualCell.module.css";
import { createSelectOptions, sortByHebrewName } from "@/utils/format";
import { SubjectType } from "@/models/types/subjects";
import { TeacherType } from "@/models/types/teachers";
import { WeeklySchedule } from "@/models/types/annualSchedule";
import { sortTeachersForSchedule } from "@/utils/teachers";
import { ClassType } from "@/models/types/classes";
import DynamicInputGroupMultiSelect from "@/components/ui/select/InputGroupMultiSelect/DynamicInputGroupMultiSelect";
import DynamicInputMultiSelect from "@/components/ui/select/InputMultiSelect/DynamicInputSelect";
import { SelectMethod } from "@/models/types/actions";
import { useAnnualTable } from "@/context/AnnualTableContext";

type AnnualCellProps = {
    day: string;
    hour: number;
    schedule: WeeklySchedule;
    selectedClassId: string;
    subjects: SubjectType[];
    teachers: TeacherType[];
    classes: ClassType[];
    isDisabled: boolean;
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
    onCreateSubject,
    onCreateTeacher,
}) => {

    const { handleAddNewRow } = useAnnualTable();
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

    const handleSubjectChange = (values: string[], method: SelectMethod) => {
        handleAddNewRow("subjects", values, day, hour, method);
    };

    const handleTeacherChange = (values: string[], method: SelectMethod) => {
        handleAddNewRow("teachers", values, day, hour, method);
    };

    return (
        <td className={styles.scheduleCell}>
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
                <DynamicInputGroupMultiSelect
                    placeholder="מורה"
                    options={sortedTeacherOptions}
                    value={schedule[selectedClassId]?.[day]?.[hour]?.teachers ?? []}
                    onChange={handleTeacherChange}
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
