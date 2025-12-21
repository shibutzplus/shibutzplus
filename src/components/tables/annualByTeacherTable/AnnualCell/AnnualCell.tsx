import React from "react";
import styles from "./AnnualCell.module.css";
import { createSelectOptions } from "@/utils/format";
import { SubjectType } from "@/models/types/subjects";
import { TeacherType } from "@/models/types/teachers";
import { WeeklySchedule, AnnualInputCellType } from "@/models/types/annualSchedule";
import { ClassType } from "@/models/types/classes";
import { SelectMethod } from "@/models/types/actions";
import { sortByHebrewName, sortClassesByName } from "@/utils/sort";
import useDeletePopup from "@/hooks/useDeletePopup";
import { PopupAction } from "@/context/PopupContext";
import DynamicInputSelect from "@/components/ui/select/InputSelect/DynamicInputSelect";
import DynamicInputMultiSelect from "@/components/ui/select/InputMultiSelect/DynamicInputSelect";

type AnnualCellProps = {
    day: string;
    hour: number;
    schedule: WeeklySchedule;
    selectedTeacherId: string;
    subjects: SubjectType[];
    classes: ClassType[];
    isDisabled: boolean;
    handleAddNewRow: (
        type: AnnualInputCellType,
        elementIds: string[],
        day: string,
        hour: number,
        method: SelectMethod,
        newElementObj?: TeacherType | SubjectType,
    ) => Promise<void>;
};

const AnnualCell: React.FC<AnnualCellProps> = ({
    day,
    hour,
    schedule,
    selectedTeacherId,
    subjects,
    classes,
    isDisabled,
    handleAddNewRow,
}) => {
    const { handleOpenPopup } = useDeletePopup();

    const handleSubjectChange = (value: string, method?: SelectMethod) => {
        handleAddNewRow("subjects", value ? [value] : [], day, hour, method || "select-option");

        if (value) {
            const selectedSubjectObj = subjects.find((s) => s.id === value);
            if (selectedSubjectObj?.activity) {
                const matchingClass = classes.find(
                    (c) => c.name === selectedSubjectObj.name && c.activity
                );
                if (matchingClass) {
                    handleAddNewRow(
                        "classes",
                        [matchingClass.id],
                        day,
                        hour,
                        method || "select-option",
                    );
                }
            }
        }
    };

    const handleClassChange = (values: string[], method: SelectMethod) => {
        handleAddNewRow("classes", values, day, hour, method);

        if (values.length > 0) {
            const activityClass = classes.find((c) => values.includes(c.id) && c.activity);
            if (activityClass) {
                const matchingSubject = subjects.find(
                    (s) => s.name === activityClass.name && s.activity
                );
                if (matchingSubject) {
                    handleAddNewRow(
                        "subjects",
                        [matchingSubject.id],
                        day,
                        hour,
                        method || "select-option",
                    );
                }
            }
        }
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
                <DynamicInputSelect
                    options={createSelectOptions<SubjectType>(sortByHebrewName(subjects || []))}
                    value={schedule[selectedTeacherId]?.[day]?.[hour]?.subjects[0] ?? ""}
                    onChange={handleSubjectChange}
                    placeholder="מקצוע"
                    isSearchable
                    isDisabled={isDisabled}
                    onBeforeRemove={confirmRemove}
                    isClearable
                />
                <DynamicInputMultiSelect
                    options={createSelectOptions<ClassType>(sortClassesByName(classes))}
                    value={schedule[selectedTeacherId]?.[day]?.[hour]?.classes ?? []}
                    onChange={handleClassChange}
                    placeholder="כיתה"
                    isSearchable
                    isDisabled={isDisabled}
                    onBeforeRemove={confirmRemove}
                    isBold
                />
            </div>
        </td>
    );
};
export default AnnualCell;
