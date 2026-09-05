
import { DailyScheduleCell, ColumnTypeValues, ColumnType } from "@/models/types/dailySchedule";
import { AppType } from "@/models/types";

export interface CellDisplayData {
    text: string;
    classNameText?: string;
    subjectText?: string;
    rawSubjectName?: string;
    subTeacherName: string | null;
    isMissing: boolean;
    isEmpty: boolean;
    isActivity: boolean;
}

/**
 * Shared logic for determining what to display in a Daily Schedule Teacher cell.
 */
export const getCellDisplayData = (
    cell: DailyScheduleCell | undefined,
    columnType: ColumnType, // Explicitly passed to ensure consistency
    appType: AppType = "private"
): CellDisplayData => {
    if (!cell) {
        return { text: '', classNameText: '', subjectText: '', rawSubjectName: '', subTeacherName: null, isMissing: false, isEmpty: true, isActivity: false };
    }

    const classesData = cell.classes;
    const subjectData = cell.subject;
    const subTeacherData = cell.subTeacher;
    const teacherText = cell.event;

    // Derived states
    const isMissingTeacher = columnType === ColumnTypeValues.missingTeacher;
    const isExistingTeacher = columnType === ColumnTypeValues.existingTeacher;
    const isActivity = classesData?.some((cls) => cls.activity) || false;

    // 1. Text Content Calculation
    let text = "";
    let classNameText = "";
    let subjectText = "";
    let rawSubjectName = "";
    if (classesData?.length) {
        const classNames = classesData.map((cls) => cls.name).join(", ");
        const subjectName = subjectData?.name || "";
        const sameAsSubject = subjectName && classNames === subjectName;
        classNameText = classNames;
        if (!isActivity && subjectData && !sameAsSubject) {
            rawSubjectName = subjectData.name;
            subjectText = `(${subjectData.name})`;
            text = `${classNames} (${subjectData.name})`;
        } else {
            text = classNames;
        }
    }

    // 2. Logic for when to hide the cell entirely (Empty)

    // Case A: Public view + Activity -> Hide (Unless there is a sub teacher or event text)
    if (appType === "public" && isActivity && !subTeacherData && !teacherText) {
        return { text, classNameText, subjectText, rawSubjectName, subTeacherName: null, isMissing: false, isEmpty: true, isActivity };
    }

    // Case B: Existing Teachers (Blue) -> ONLY show if there's a substitute or event text (Change).
    // If it's a regular lesson (no sub/event), it should be hidden/empty.
    if (
        isExistingTeacher &&
        !subTeacherData &&
        !teacherText
    ) {
        return { text, classNameText, subjectText, rawSubjectName, subTeacherName: null, isMissing: false, isEmpty: true, isActivity };
    }

    // Case C: Standard "Empty" check from PreviewTeacherCell
    // If no sub teacher, no event text, and (not missing teacher OR (no class data AND no subject))
    if (
        !subTeacherData &&
        !teacherText &&
        (!isMissingTeacher || (!classesData?.length && !subjectData))
    ) {
        return { text, classNameText, subjectText, rawSubjectName, subTeacherName: null, isMissing: false, isEmpty: true, isActivity };
    }

    // 3. Return valid data
    return {
        text,
        classNameText,
        subjectText,
        rawSubjectName,
        subTeacherName: subTeacherData?.name || teacherText || null, // teacherText is treated as subTeacher name in display if present
        isMissing: isMissingTeacher && !subTeacherData && !teacherText && !isActivity,
        isEmpty: false,
        isActivity
    };
};
