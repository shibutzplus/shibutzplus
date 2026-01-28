import { AnnualScheduleType, WeeklySchedule } from "@/models/types/annualSchedule";
import { DAYS_OF_WEEK } from "@/utils/time";

/**
 * Iterates through the table once and populates the relevant class schedules. O(N)
 */
export const populateAllClassesSchedule = (
    annualScheduleTable: AnnualScheduleType[] | undefined,
    newSchedule: WeeklySchedule,
) => {
    if (!annualScheduleTable || annualScheduleTable.length === 0) return newSchedule;

    annualScheduleTable.forEach((entry) => {
        const classId = entry.classId || entry.class?.id;
        if (!classId || !newSchedule[classId]) return;

        const dayName = DAYS_OF_WEEK[entry.day - 1];
        if (!dayName || !newSchedule[classId][dayName]) return;

        // Ensure cell exists
        if (!newSchedule[classId][dayName][entry.hour]) {
            newSchedule[classId][dayName][entry.hour] = {
                teachers: [],
                subjects: [],
                classes: [],
            };
        }

        const cell = newSchedule[classId][dayName][entry.hour];

        const teacherId = entry.teacherId || entry.teacher?.id;
        if (teacherId && !cell.teachers.includes(teacherId)) {
            cell.teachers.push(teacherId);
        }
        const subjectId = entry.subjectId || entry.subject?.id;
        if (subjectId && !cell.subjects.includes(subjectId)) {
            cell.subjects.push(subjectId);
        }
        // const classId is already defined
        if (classId && !cell.classes.includes(classId)) {
            cell.classes.push(classId);
        }
    });

    return newSchedule;
};

/**
 * Iterates through the table once and populates the relevant teacher schedules. O(N)
 */
export const populateAllTeachersSchedule = (
    annualScheduleTable: AnnualScheduleType[] | undefined,
    newSchedule: WeeklySchedule,
) => {
    if (!annualScheduleTable || annualScheduleTable.length === 0) return newSchedule;

    annualScheduleTable.forEach((entry) => {
        const teacherId = entry.teacherId || entry.teacher?.id;
        if (!teacherId || !newSchedule[teacherId]) return;

        const dayName = DAYS_OF_WEEK[entry.day - 1];
        if (!dayName || !newSchedule[teacherId][dayName]) return;

        // Ensure cell exists
        if (!newSchedule[teacherId][dayName][entry.hour]) {
            newSchedule[teacherId][dayName][entry.hour] = {
                teachers: [],
                subjects: [],
                classes: [],
            };
        }

        const cell = newSchedule[teacherId][dayName][entry.hour];

        // teacherId already defined
        if (teacherId && !cell.teachers.includes(teacherId)) {
            cell.teachers.push(teacherId);
        }
        const subjectId = entry.subjectId || entry.subject?.id;
        if (subjectId && !cell.subjects.includes(subjectId)) {
            cell.subjects.push(subjectId);
        }
        const classId = entry.classId || entry.class?.id;
        if (classId && !cell.classes.includes(classId)) {
            cell.classes.push(classId);
        }
    });

    return newSchedule;
};
