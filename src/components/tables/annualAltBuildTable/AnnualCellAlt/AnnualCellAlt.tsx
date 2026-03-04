import React, { useMemo } from "react";
import styles from "./AnnualCellAlt.module.css";
import { createSelectOptions } from "@/utils/format";
import { SubjectType } from "@/models/types/subjects";
import { TeacherRoleValues, TeacherType } from "@/models/types/teachers";
import { WeeklySchedule, AnnualInputCellType } from "@/models/types/annualSchedule";
import { ClassType } from "@/models/types/classes";
import { useAnnualAltByDay } from "@/context/AnnualAltByDayContext";

import DynamicInputMultiSelect from "@/components/ui/select/InputMultiSelect/DynamicInputSelect";
import { SelectMethod } from "@/models/types/actions";

type AnnualCellAltProps = {
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
    handleScheduleUpdate: (
        type: AnnualInputCellType,
        elementIds: string[],
        day: string,
        hour: number,
        method: SelectMethod,
        newElementObj?: TeacherType | SubjectType,
    ) => Promise<void>;
};

const AnnualCellAlt: React.FC<AnnualCellAltProps> = ({
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
    handleScheduleUpdate,
}) => {
    const { autoFillMissingSubjects } = useAnnualAltByDay();

    const sortedTeacherOptions = useMemo(() => {
        const regularTeachers = (teachers || []).filter((t) => t.role === TeacherRoleValues.REGULAR);
        return createSelectOptions(regularTeachers);
    }, [teachers]);

    const handleSubjectChange = (values: string[], method: SelectMethod) => {
        handleScheduleUpdate("subjects", values, day, hour, method);
    };

    const handleTeacherChange = (values: string[], method: SelectMethod) => {
        handleScheduleUpdate("teachers", values, day, hour, method);

        if (values.length > 0) {
            const selectedClassObj = classes.find((c) => c.id === selectedClassId);
            if (selectedClassObj?.activity) {
                const matchingSubject = subjects.find((s) => s.name === selectedClassObj.name);
                const currentSubjects = schedule[selectedClassId]?.[day]?.[hour]?.subjects || [];

                if (matchingSubject && !currentSubjects.includes(matchingSubject.id)) {
                    handleScheduleUpdate("subjects", [matchingSubject.id], day, hour, method);
                }
            }
        } else {
            // Specific logic for Alt Build: if no teachers remain, remove subjects
            const currentSubjects = schedule[selectedClassId]?.[day]?.[hour]?.subjects || [];
            if (currentSubjects.length > 0) {
                handleScheduleUpdate("subjects", [], day, hour, method);
            }
        }
    };

    const handleBlur = (e: React.FocusEvent) => {
        // If the new focus target is outside this cell, trigger auto-fill
        if (!e.currentTarget.contains(e.relatedTarget as Node)) {
            autoFillMissingSubjects();
        }
    };

    const confirmRemove = (_what: string | null, proceed: () => void) => {
        proceed();
    };

    const filteredSubjects = useMemo(() => {
        const selectedClassObj = classes.find((c) => c.id === selectedClassId);
        if (selectedClassObj?.activity) {
            return subjects.filter((s) => s.name === selectedClassObj.name);
        }
        return subjects || [];
    }, [classes, selectedClassId, subjects]);

    const isActivity = classes.find((c) => c.id === selectedClassId)?.activity;

    const subjectOptions = useMemo(
        () => createSelectOptions<SubjectType>(filteredSubjects),
        [filteredSubjects],
    );

    return (
        <td className={styles.scheduleCell}>
            <div className={styles.cellContent} onBlur={handleBlur}>
                <DynamicInputMultiSelect
                    options={sortedTeacherOptions}
                    value={schedule[selectedClassId]?.[day]?.[hour]?.teachers ?? []}
                    onChange={handleTeacherChange}
                    placeholder="מורה"
                    isSearchable
                    isAllowAddNew
                    isBold
                    isDisabled={isDisabled}
                    onCreate={(v: string) => {
                        return onCreateTeacher(day, hour, v);
                    }}
                    onBeforeRemove={confirmRemove}
                />
                <DynamicInputMultiSelect
                    options={subjectOptions}
                    value={schedule[selectedClassId]?.[day]?.[hour]?.subjects ?? []}
                    onChange={handleSubjectChange}
                    placeholder="מקצוע"
                    isSearchable
                    isAllowAddNew={!isActivity}
                    isDisabled={isDisabled}
                    onCreate={(value: string) => onCreateSubject(day, hour, value)}
                    onBeforeRemove={confirmRemove}
                />
            </div>
        </td>
    );
};
export default AnnualCellAlt;
