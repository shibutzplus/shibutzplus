import { AnnualScheduleType } from "@/models/types/annualSchedule";

/**
 * Counts how many annual schedule entries use the given subject
 */
export const countSubjectUsage = (
    subjectId: string,
    annualSchedule?: AnnualScheduleType[],
): number => {
    if (!annualSchedule || !subjectId) return 0;
    return annualSchedule.filter(
        (item) => item.subject?.id === subjectId || item.subjectId === subjectId,
    ).length;
};

/**
 * Counts how many annual schedule entries use the given teacher
 */
export const countTeacherUsage = (
    teacherId: string,
    annualSchedule?: AnnualScheduleType[],
): number => {
    if (!annualSchedule || !teacherId) return 0;
    return annualSchedule.filter(
        (item) => item.teacher?.id === teacherId || item.teacherId === teacherId,
    ).length;
};

/**
 * Counts how many annual schedule entries use the given class / group
 */
export const countClassUsage = (
    classId: string,
    annualSchedule?: AnnualScheduleType[],
): number => {
    if (!annualSchedule || !classId) return 0;
    return annualSchedule.filter(
        (item) => item.class?.id === classId || item.classId === classId,
    ).length;
};
