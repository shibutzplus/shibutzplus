import React, { useMemo } from "react";
import styles from "./AnnualCell.module.css";
import { createSelectOptions } from "@/utils/format";
import { SubjectType } from "@/models/types/subjects";
import { TeacherType } from "@/models/types/teachers";
import { WeeklySchedule, AnnualInputCellType } from "@/models/types/annualSchedule";
import { ClassType } from "@/models/types/classes";
import DynamicInputGroupMultiSelect from "@/components/ui/select/InputGroupMultiSelect/DynamicInputGroupMultiSelect";
import DynamicInputMultiSelect from "@/components/ui/select/InputMultiSelect/DynamicInputSelect";
import DynamicInputSelect from "@/components/ui/select/InputSelect/DynamicInputSelect";
import { SelectMethod } from "@/models/types/actions";
import { sortAnnualTeachers, sortByHebrewName } from "@/utils/sort";
import useDeletePopup from "@/hooks/useDeletePopup";
import { PopupAction } from "@/context/PopupContext";

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
    handleAddNewRow: (
        type: AnnualInputCellType,
        elementIds: string[],
        day: string,
        hour: number,
        method: SelectMethod,
        newElementObj?: TeacherType | SubjectType,
    ) => Promise<void>;
    isTeacherView?: boolean;
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
    handleAddNewRow,
    isTeacherView,
}) => {
    const { handleOpenPopup } = useDeletePopup();

    const sortedTeacherOptions = useMemo(
        () =>
            sortAnnualTeachers(teachers || [], classes || [], schedule, selectedClassId, day, hour),
        [teachers, classes, schedule, selectedClassId, day, hour],
    );

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
            async () => {
                proceed();
            },
        );
    };

    return (
        <td className={styles.scheduleCell}>
            <div className={styles.cellContent}>
                {isTeacherView ? (
                    <>
                        <DynamicInputSelect
                            options={createSelectOptions<SubjectType>(sortByHebrewName(subjects || []))}
                            value={schedule[selectedClassId]?.[day]?.[hour]?.subjects?.[0] ?? ""}
                            onChange={(val) => handleSubjectChange(val ? [val] : [], val ? "create-option" : "remove-value")}
                            placeholder="מקצוע"
                            isSearchable
                            isClearable
                            isDisabled={isDisabled}
                        />
                        <DynamicInputSelect
                            options={createSelectOptions<ClassType>(sortByHebrewName(classes || []))}
                            value={schedule[selectedClassId]?.[day]?.[hour]?.classId ?? ""}
                            onChange={(val) => handleAddNewRow("classes", val ? [val] : [], day, hour, val ? "create-option" : "remove-value")}
                            placeholder="כיתה"
                            isSearchable
                            isClearable
                            isDisabled={isDisabled}
                        />
                    </>
                ) : (
                    <>
                        <DynamicInputMultiSelect
                            options={createSelectOptions<SubjectType>(sortByHebrewName(subjects || []))}
                            value={schedule[selectedClassId]?.[day]?.[hour]?.subjects ?? []}
                            onChange={handleSubjectChange}
                            placeholder="מקצוע"
                            isSearchable
                            isAllowAddNew
                            isDisabled={isDisabled}
                            onCreate={(value: string) => onCreateSubject(day, hour, value)}
                            onBeforeRemove={confirmRemove}
                        />
                        <DynamicInputGroupMultiSelect
                            options={sortedTeacherOptions}
                            value={schedule[selectedClassId]?.[day]?.[hour]?.teachers ?? []}
                            onChange={handleTeacherChange}
                            placeholder="מורה"
                            isSearchable
                            isAllowAddNew
                            isDisabled={isDisabled}
                            isBold
                            onCreate={(v: string) => {
                                return onCreateTeacher(day, hour, v);
                            }}
                            onBeforeRemove={confirmRemove}
                        />
                    </>
                )}
            </div>
        </td>
    );
};
export default AnnualCell;
