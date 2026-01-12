
import { DailyScheduleCell, ColumnTypeValues, ColumnType } from "@/models/types/dailySchedule";
import { AppType } from "@/models/types";

export interface CellDisplayData {
    text: string;
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
    columnTypeInt: ColumnType, // Explicitly passed to ensure consistency
    appType: AppType = "private"
): CellDisplayData => {
    if (!cell) {
        return { text: '', subTeacherName: null, isMissing: false, isEmpty: true, isActivity: false };
    }

    const classesData = cell.classes;
    const subjectData = cell.subject;
    const subTeacherData = cell.subTeacher;
    const teacherText = cell.event;

    // Derived states
    const isMissingTeacher = columnTypeInt === ColumnTypeValues.missingTeacher;
    const isExistingTeacher = columnTypeInt === ColumnTypeValues.existingTeacher;
    const isActivity = classesData?.some((cls) => cls.activity) || false;

    // 1. Text Content Calculation
    let text = "";
    if (classesData?.length) {
        const classNames = classesData.map((cls) => cls.name).join(", ");
        const subjectName = subjectData?.name || "";
        const sameAsSubject = subjectName && classNames === subjectName;
        text = classNames + (!isActivity && subjectData && !sameAsSubject ? ` (${subjectData.name})` : "");
    }

    // 2. Logic for when to hide the cell entirely (Empty)

    // Case A: Public view + Activity -> Hide
    if (appType === "public" && isActivity) {
        return { text, subTeacherName: subTeacherData?.name || null, isMissing: false, isEmpty: true, isActivity };
    }

    // Case B: Existing Teachers (Blue) -> ONLY show if there's a substitute or event text (Change).
    // If it's a regular lesson (no sub/event), it should be hidden/empty.
    if (
        isExistingTeacher &&
        !subTeacherData &&
        !teacherText
    ) {
        return { text, subTeacherName: null, isMissing: false, isEmpty: true, isActivity };
    }

    // Case C: Standard "Empty" check from PreviewTeacherCell
    // If no sub teacher, no event text, and (not missing teacher OR (no class data AND no subject))
    if (
        !subTeacherData &&
        !teacherText &&
        (!isMissingTeacher || (!classesData?.length && !subjectData))
    ) {
        return { text, subTeacherName: null, isMissing: false, isEmpty: true, isActivity };
    }

    // 3. Return valid data
    return {
        text,
        subTeacherName: subTeacherData?.name || teacherText || null, // teacherText is treated as subTeacher name in display if present
        isMissing: isMissingTeacher && !subTeacherData && !teacherText && !isActivity,
        isEmpty: false,
        isActivity
    };
};
