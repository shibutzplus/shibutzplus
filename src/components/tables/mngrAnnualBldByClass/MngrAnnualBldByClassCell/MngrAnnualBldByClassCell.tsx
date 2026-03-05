import React, { useMemo } from "react";
import styles from "./MngrAnnualBldByClassCell.module.css";
import { createSelectOptions } from "@/utils/format";
import { SubjectType } from "@/models/types/subjects";
import { TeacherRoleValues, TeacherType } from "@/models/types/teachers";
import { WeeklySchedule, AnnualInputCellType } from "@/models/types/annualSchedule";
import { ClassType } from "@/models/types/classes";
import DynamicInputMultiSelect from "@/components/ui/select/InputMultiSelect/DynamicInputSelect";
import { SelectMethod } from "@/models/types/actions";
import useConfirmPopup from "@/hooks/useConfirmPopup";
import { PopupAction } from "@/context/PopupContext";

type MngrAnnualBldByClassCellProps = {
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

const MngrAnnualBldByClassCell: React.FC<MngrAnnualBldByClassCellProps> = ({
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
    const { handleOpenPopup } = useConfirmPopup();

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
        }
    };

    const confirmRemove = (what: string | null, proceed: () => void) => {
        const cellData = schedule[selectedClassId]?.[day]?.[hour];
        const isFull = (cellData?.subjects?.length ?? 0) > 0 && (cellData?.teachers?.length ?? 0) > 0;

        if (!isFull) {
            proceed();
            return;
        }

        handleOpenPopup(
            PopupAction.deleteTeacher,
            what ? `האם למחוק את ${what}?` : "האם למחוק את הפריט?",
            async () => {
                proceed();
            },
            "מחיקה",
            "ביטול"
        );
    };

    const selectedClassObj = useMemo(
        () => classes.find((c) => c.id === selectedClassId),
        [classes, selectedClassId],
    );

    const isActivity = selectedClassObj?.activity;

    const subjectOptions = useMemo(() => {
        const filtered = selectedClassObj?.activity
            ? subjects.filter((s) => s.name === selectedClassObj.name)
            : subjects || [];
        return createSelectOptions<SubjectType>(filtered);
    }, [selectedClassObj, subjects]);

    return (
        <td className={styles.scheduleCell}>
            <div className={styles.cellContent}>
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
export default MngrAnnualBldByClassCell;
