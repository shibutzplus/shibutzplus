import React, { useMemo } from "react";
import styles from "./AnnualCell.module.css";
import { createSelectOptions } from "@/utils/format";
import { SubjectType } from "@/models/types/subjects";
import { TeacherType } from "@/models/types/teachers";
import { WeeklySchedule } from "@/models/types/annualSchedule";
import { ClassType } from "@/models/types/classes";
import DynamicInputGroupMultiSelect from "@/components/ui/select/InputGroupMultiSelect/DynamicInputGroupMultiSelect";
import DynamicInputMultiSelect from "@/components/ui/select/InputMultiSelect/DynamicInputSelect";
import { SelectMethod } from "@/models/types/actions";
import { useAnnualTable } from "@/context/AnnualTableContext";
import { sortAnnualTeachers, sortByHebrewName } from "@/utils/sort";
import useDeletePopup from "@/hooks/useDeletePopup";
import { PopupAction } from "@/context/PopupContext";
import { dayToNumber } from "@/utils/time";

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
    selectedTeacherId: string;
};

const TEACHER_SCHEDULE = "__TEACHER__";

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
    selectedTeacherId,
}) => {
    const { handleAddNewRow } = useAnnualTable();
    const { handleOpenPopup } = useDeletePopup();

    // Treat special value as "teacher-only" schedule bucket
    const isTeacherSchedule = selectedClassId === TEACHER_SCHEDULE;
    const effectiveClassId = isTeacherSchedule ? "" : selectedClassId;

    const sortedTeacherOptions = useMemo(
        () =>
            sortAnnualTeachers(
                teachers || [],
                classes || [],
                schedule,
                effectiveClassId,
                day,
                hour
            ),
        [teachers, classes, schedule, effectiveClassId, day, hour],
    );

    // Handlers
    const handleSubjectChange = (values: string[], method: SelectMethod) => {
        handleAddNewRow("subjects", values, day, hour, method);
    };

    const handleTeacherChange = (values: string[], method: SelectMethod) => {
        handleAddNewRow("teachers", values, day, hour, method);
    };

    const confirmRemove = (what: string | null, proceed: () => void) => {
        handleOpenPopup(
            PopupAction.deleteTeacher,
            what ? `למחוק את ${what} מהרשימה?` : "למחוק את הפריט מהרשימה?",
            async () => proceed(),
        );
    };

    // Keys normalization (minimal, non-breaking)
    const hourKey = String(hour);
    const dayKeyAlt = String(dayToNumber(day));

    // Resolve teacher IDs and subjects with tolerant keys
    const teacherIds: string[] = effectiveClassId
        ? (
            schedule[effectiveClassId]?.[day]?.[hour]?.teachers ??
            schedule[effectiveClassId]?.[day]?.[hourKey]?.teachers ??
            schedule[effectiveClassId]?.[dayKeyAlt]?.[hour]?.teachers ??
            schedule[effectiveClassId]?.[dayKeyAlt]?.[hourKey]?.teachers ??
            []
        )
        : [];

    const subjectIdsInBucket: string[] = effectiveClassId
        ? (
            schedule[effectiveClassId]?.[day]?.[hour]?.subjects ??
            schedule[effectiveClassId]?.[day]?.[hourKey]?.subjects ??
            schedule[effectiveClassId]?.[dayKeyAlt]?.[hour]?.subjects ??
            schedule[effectiveClassId]?.[dayKeyAlt]?.[hourKey]?.subjects ??
            []
        )
        : [];

    const subjectNames =
        subjectIdsInBucket
            .map((id) => subjects.find((s) => s.id === id)?.name)
            .filter(Boolean)
            .filter((v, i, a) => a.indexOf(v) === i)
            .join(", ") || "";

    // If both class and teacher are selected but teacher not in this slot → empty cell
    if (effectiveClassId && selectedTeacherId && !teacherIds.includes(selectedTeacherId)) {
        return <td className={styles.scheduleCell}></td>;
    }

    // Modes
    const isClassOnly = effectiveClassId && !selectedTeacherId;
    const isClassAndTeacher = effectiveClassId && selectedTeacherId;
    const isTeacherOnly = isTeacherSchedule && selectedTeacherId;

    // Teacher-only: Display subject + class
    if (isTeacherOnly) {
        const teacherSlot =
            schedule[TEACHER_SCHEDULE]?.[day]?.[hour] ??
            schedule[TEACHER_SCHEDULE]?.[day]?.[hourKey] ??
            schedule[TEACHER_SCHEDULE]?.[dayKeyAlt]?.[hour] ??
            schedule[TEACHER_SCHEDULE]?.[dayKeyAlt]?.[hourKey];

        if (!teacherSlot) return <td className={styles.scheduleCell}></td>;

        const subjNames = (teacherSlot.subjects || [])
            .map((id) => subjects.find((s) => s.id === id)?.name)
            .filter(Boolean)
            .filter((v, i, a) => a.indexOf(v) === i)
            .join(", ");

        const matchedClass = classes.find((c) => c.id === teacherSlot.classId);
        console.log("Class resolve:", { classId: teacherSlot.classId, matchedClass });

        const classLabel = matchedClass?.name || "";

        return (
            <td className={styles.scheduleCell}>
                <div className={`${styles.cellContent} ${styles.viewOnly}`}>
                    <div>{classLabel}</div>
                    <div>{subjNames}</div>
                </div>
            </td>
        );

    }
    

    // Class + Teacher: Display subjects only
    if (isClassAndTeacher) {
        return (
            <td className={styles.scheduleCell}>
                <div className={`${styles.cellContent} ${styles.viewOnly}`}>{subjectNames}</div>
            </td>
        );
    }

    // Default: Class only (editable subject + teacher)
    if (isClassOnly) {
        return (
            <td className={styles.scheduleCell}>
                <div className={styles.cellContent}>
                    <DynamicInputMultiSelect
                        placeholder="מקצוע"
                        options={createSelectOptions<SubjectType>(sortByHebrewName(subjects || []))}
                        value={
                            schedule[effectiveClassId]?.[day]?.[hour]?.subjects ??
                            schedule[effectiveClassId]?.[day]?.[hourKey]?.subjects ??
                            schedule[effectiveClassId]?.[dayKeyAlt]?.[hour]?.subjects ??
                            schedule[effectiveClassId]?.[dayKeyAlt]?.[hourKey]?.subjects ??
                            []
                        }
                        onChange={handleSubjectChange}
                        onCreate={(value: string) => onCreateSubject(day, hour, value)}
                        isSearchable
                        isAllowAddNew
                        isDisabled={isDisabled}
                        onBeforeRemove={confirmRemove}
                    />
                    <DynamicInputGroupMultiSelect
                        placeholder="מורה"
                        options={sortedTeacherOptions}
                        value={teacherIds}
                        onChange={handleTeacherChange}
                        isSearchable
                        isAllowAddNew
                        onCreate={(v: string) => onCreateTeacher(day, hour, v)}
                        isDisabled={isDisabled}
                        onBeforeRemove={confirmRemove}
                    />
                </div>
            </td>
        );
    }

    // No class and no teacher → empty cell
    return <td className={styles.scheduleCell}></td>;
};

export default AnnualCell;
