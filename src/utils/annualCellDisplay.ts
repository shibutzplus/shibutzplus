import { AnnualScheduleCell } from "@/models/types/annualSchedule";
import { ClassType } from "@/models/types/classes";
import { SubjectType } from "@/models/types/subjects";
import { TeacherType } from "@/models/types/teachers";

export interface AnnualCellDisplayData {
    subjectsText: string;
    secondaryText: string;
    shouldRender: boolean;
}

export const getAnnualCellDisplayData = (
    cellData: AnnualScheduleCell | undefined,
    selectedClassId: string,
    selectedTeacherId: string,
    subjects: SubjectType[],
    teachers: TeacherType[],
    classes: ClassType[]
): AnnualCellDisplayData => {
    if (!cellData) {
        return { subjectsText: "", secondaryText: "", shouldRender: false };
    }

    const { teachers: teacherIds, subjects: subjectIds, classes: classesIds } = cellData;

    // Helper lookups
    const getSubjectName = (id: string) => subjects.find((s) => s.id === id)?.name || "";
    const getTeacherName = (id: string) => teachers.find((t) => t.id === id)?.name || "";
    const getClassName = (id: string) => classes.find((c) => c.id === id)?.name || "";
    const isActivityClass = (id: string) => classes.find((c) => c.id === id)?.activity;

    const isClassView = !!selectedClassId;
    const isTeacherView = !!selectedTeacherId;
    const isBothSelected = isClassView && isTeacherView;

    // 1. Filtering Logic
    if (isBothSelected) {
        // If both selected, verify the teacher is actually in this cell
        const isTeacherInCell = teacherIds.includes(selectedTeacherId);
        if (!isTeacherInCell) {
            return { subjectsText: "", secondaryText: "", shouldRender: false };
        }
    }

    // 2. Content Generation

    // Subjects
    // Common logic: Show subjects unless it's an activity class (checked against relevant IDs)
    let showSubjects = true;
    if (isClassView) {
        // In Class View, hide subjects if the *selected* class is an activity
        if (isActivityClass(selectedClassId)) showSubjects = false;
    } else {
        // In Teacher View (or Both), hide subjects if *any* class in the cell is an activity
        // (This matches the AnnualViewCell logic: !classesIds?.some((id) => isActivityClass(id)))
        if (classesIds?.some((id) => isActivityClass(id))) showSubjects = false;
    }

    // Note: The original generic logic was slightly different between Class View and Teacher View 
    // regarding which ID to check. 
    // Class View checks `selectedClassId`. Teacher View checks `classesIds` array.

    let subjectsText = "";
    if (showSubjects && subjectIds && subjectIds.length > 0) {
        subjectsText = subjectIds.map(getSubjectName).join(", ");
    }

    // Secondary Info (Teachers or Classes)
    let secondaryText = "";

    if (isBothSelected) {
        // Both selected -> Only Subject shown (secondary hidden)
        secondaryText = "";
    } else if (isClassView) {
        // Class View -> Show Teachers
        if (teacherIds && teacherIds.length > 0) {
            secondaryText = teacherIds.map(getTeacherName).join(", ");
        }
    } else {
        // Teacher View -> Show Classes
        // Note: Logic shows Class BEFORE Subject in original code? 
        // No, current Request 106/109 changed it to Subject FIRST.
        if (classesIds && classesIds.length > 0) {
            secondaryText = classesIds.map(getClassName).join(", ");
        }
    }

    return {
        subjectsText,
        secondaryText,
        shouldRender: true
    };
};

export const getAnnualScheduleDimensions = (
    schedule: import("@/models/types/annualSchedule").WeeklySchedule | undefined,
    selectedClassId: string,
    selectedTeacherId: string,
    toHour: number = 10,
    fromHour: number = 1
) => {
    const lookupId = selectedClassId || selectedTeacherId;
    let maxHourWithData = 0;

    if (lookupId && schedule && schedule[lookupId]) {
        Object.values(schedule[lookupId]).forEach((dayData) => {
            Object.entries(dayData).forEach(([hourStr, cell]) => {
                const hourVal = parseInt(hourStr, 10);

                // If both selected, apply the same filter to the row count calculation
                if (selectedClassId && selectedTeacherId) {
                    if (!cell.teachers?.includes(selectedTeacherId)) {
                        return; // Skip this cell if teacher not present
                    }
                }

                if (
                    (cell.teachers && cell.teachers.length > 0) ||
                    (cell.subjects && cell.subjects.length > 0) ||
                    (cell.classes && cell.classes.length > 0)
                ) {
                    maxHourWithData = Math.max(maxHourWithData, hourVal);
                }
            });
        });
    }

    const minLastRow = Math.max(6, fromHour);
    const lastRow = Math.min(toHour, Math.max(minLastRow, maxHourWithData));
    const rowsCount = Math.max(0, lastRow - fromHour + 1);

    return { rowsCount };
};
