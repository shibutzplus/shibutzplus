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
        handleAddNewRow("subjects", [value], day, hour, method || "select-option");
    };

    const handleClassChange = (value: string, method?: SelectMethod) => {
        handleAddNewRow("classes", [value], day, hour, method || "select-option");
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
                    value={schedule[selectedClassId]?.[day]?.[hour]?.subjects[0] ?? ""}
                    onChange={handleSubjectChange}
                    placeholder="מקצוע"
                    isSearchable
                    isDisabled={isDisabled}
                    onBeforeRemove={confirmRemove}
                />
                <DynamicInputSelect
                    options={createSelectOptions<ClassType>(sortByHebrewName(classes || []))}
                    value={schedule[selectedClassId]?.[day]?.[hour]?.classId ?? ""}
                    onChange={handleClassChange}
                    placeholder="כיתה"
                    isSearchable
                    isDisabled={isDisabled}
                    onBeforeRemove={confirmRemove}
                />
            </div>
        </td>
    );
};
export default AnnualCell;
