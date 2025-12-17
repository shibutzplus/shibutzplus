import React from "react";
import styles from "./AnnualCell.module.css";
import { createSelectOptions } from "@/utils/format";
import { SubjectType } from "@/models/types/subjects";
import { TeacherType } from "@/models/types/teachers";
import { WeeklySchedule, AnnualInputCellType } from "@/models/types/annualSchedule";
import { ClassType } from "@/models/types/classes";
import { SelectMethod } from "@/models/types/actions";
import { sortByHebrewName } from "@/utils/sort";
import useDeletePopup from "@/hooks/useDeletePopup";
import { PopupAction } from "@/context/PopupContext";
import DynamicInputMultiSelect from "@/components/ui/select/InputMultiSelect/DynamicInputSelect";
import DynamicInputSelect from "@/components/ui/select/InputSelect/DynamicInputSelect";

type AnnualCellProps = {
    day: string;
    hour: number;
    schedule: WeeklySchedule;
    selectedClassId: string;
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
    selectedClassId,
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

        // Logic for auto-selecting subject if a class with activity is selected
        if (values.length > 0) {
            if (values.length === 1) {
                const val = values[0];
                const selectedClassObj = classes.find((c) => c.id === val);
                if (selectedClassObj?.activity) {
                    const matchingSubject = subjects.find(
                        (s) => s.name === selectedClassObj.name && s.activity
                    );
                    if (matchingSubject) {
                        const currentSubjects = schedule[selectedClassId]?.[day]?.[hour]?.subjects || [];
                        if (!currentSubjects.includes(matchingSubject.id)) {
                            handleAddNewRow("subjects", [...currentSubjects, matchingSubject.id], day, hour, "select-option");
                        }
                    }
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
                    value={schedule[selectedClassId]?.[day]?.[hour]?.subjects?.[0] ?? ""}
                    onChange={handleSubjectChange}
                    placeholder="מקצוע"
                    isSearchable
                    isDisabled={isDisabled}
                    onBeforeRemove={confirmRemove}
                    isClearable
                />
                <DynamicInputMultiSelect
                    options={createSelectOptions<ClassType>(
                        [...(classes || [])].sort((a, b) => {
                            if (a.activity !== b.activity) {
                                return a.activity ? 1 : -1;
                            }
                            return a.name.localeCompare(b.name, "he", { numeric: true });
                        }),
                    )}
                    value={schedule[selectedClassId]?.[day]?.[hour]?.classes ?? []}
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
