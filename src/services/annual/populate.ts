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
        const classId = entry.class?.id;
        if (!classId || !newSchedule[classId]) return;

        const dayName = DAYS_OF_WEEK[entry.day - 1];
        if (!dayName || !newSchedule[classId][dayName]) return;

        // Ensure cell exists
        if (!newSchedule[classId][dayName][entry.hour]) {
            newSchedule[classId][dayName][entry.hour] = {
                teachers: [],
                subjects: [],
                classId: classId,
            };
        } else if (!newSchedule[classId][dayName][entry.hour].classId) {
            newSchedule[classId][dayName][entry.hour].classId = classId;
        }

        const cell = newSchedule[classId][dayName][entry.hour];

        if (entry.teacher?.id && !cell.teachers.includes(entry.teacher.id)) {
            cell.teachers.push(entry.teacher.id);
        }
        if (entry.subject?.id && !cell.subjects.includes(entry.subject.id)) {
            cell.subjects.push(entry.subject.id);
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
        const teacherId = entry.teacher?.id;
        if (!teacherId || !newSchedule[teacherId]) return;

        const dayName = DAYS_OF_WEEK[entry.day - 1];
        if (!dayName || !newSchedule[teacherId][dayName]) return;

        // Ensure cell exists
        if (!newSchedule[teacherId][dayName][entry.hour]) {
            newSchedule[teacherId][dayName][entry.hour] = {
                teachers: [],
                subjects: [],
                classId: entry.class?.id,
            };
        } else if (!newSchedule[teacherId][dayName][entry.hour].classId) {
            newSchedule[teacherId][dayName][entry.hour].classId = entry.class?.id;
        }

        const cell = newSchedule[teacherId][dayName][entry.hour];

        if (entry.teacher?.id && !cell.teachers.includes(entry.teacher.id)) {
            cell.teachers.push(entry.teacher.id);
        }
        if (entry.subject?.id && !cell.subjects.includes(entry.subject.id)) {
            cell.subjects.push(entry.subject.id);
        }
    });

    return newSchedule;
};
