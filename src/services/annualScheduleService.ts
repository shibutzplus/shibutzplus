import { Pair } from "@/models/types";
import { AnnualScheduleRequest, WeeklySchedule, AnnualScheduleType } from "@/models/types/annualSchedule";
import { ClassType } from "@/models/types/classes";
import { SchoolType } from "@/models/types/school";
import { SubjectType } from "@/models/types/subjects";
import { TeacherType } from "@/models/types/teachers";
import { dayToNumber } from "@/utils/time";

export const getSelectedClass = (classes: ClassType[] | undefined, selectedClassId: string) => {
    return classes?.find((c) => c.id === selectedClassId);
};

export const setNewScheduleTemplate = (
    newSchedule: WeeklySchedule,
    selectedClassId: string,
    day: string,
    hour: number,
) => {
    // If there is no cell, create template one
    if (!newSchedule[selectedClassId]) {
        newSchedule[selectedClassId] = {};
    }
    if (!newSchedule[selectedClassId][day]) {
        newSchedule[selectedClassId][day] = {};
    }
    if (!newSchedule[selectedClassId][day][hour]) {
        newSchedule[selectedClassId][day][hour] = { teachers: [], subjects: [], classId: selectedClassId };
    }
    return newSchedule;
};

export const createAnnualRequests = (
    selectedClassObj: ClassType | undefined,
    school: SchoolType | undefined,
    teachers: TeacherType[] | undefined,
    subjects: SubjectType[] | undefined,
    pairs: Pair[],
    day: string,
    hour: number,
) => {
    const requests: AnnualScheduleRequest[] = [];
    for (const pair of pairs) {
        if (!selectedClassObj || !school) continue;
        const teacher = teachers?.find((t) => t.id === pair[0]);
        const subject = subjects?.find((s) => s.id === pair[1]);
        if (!teacher || !subject) continue;
        const request: AnnualScheduleRequest = {
            day: dayToNumber(day),
            hour: hour,
            school: school,
            class: selectedClassObj,
            teacher: teacher,
            subject: subject,
        };
        requests.push(request);
    }
    return requests;
};

export const createPairs = (teacherIds: string[], subjectIds: string[]) => {
    const res: Pair[] = [];
    const lastTwoIdx = subjectIds.length - 1;
    for (let i = 0; i < teacherIds.length; i++) {
        const j = i < subjectIds.length ? i : lastTwoIdx;
        res.push([teacherIds[i], subjectIds[j]]);
    }
    return res;
};

export const getUniqueCellsFromQueue = (queueRows: AnnualScheduleRequest[]) => {
    const cells = queueRows.map((row) => ({
        day: row.day,
        hour: row.hour,
    }));
    const uniqueCells = cells.filter(
        (cell, index) =>
            cells.findIndex((c) => c.day === cell.day && c.hour === cell.hour) === index,
    );
    return uniqueCells;
};

/**
 * Build reverse index: day -> hour -> teacherId -> classId
 */
export const buildTeacherAtIndex = (schedule: WeeklySchedule) => {
    const index: Record<string, Record<string, Record<string, string>>> = {};
    for (const [classKey, days] of Object.entries(schedule || {})) {
        if (classKey === "__TEACHER__") continue; // skip synthetic bucket
        for (const [day, hours] of Object.entries(days || {})) {
            for (const [hour, cell] of Object.entries(hours || {})) {
                const classId = cell?.classId || classKey;
                const teacherIds = cell?.teachers || [];
                if (!index[day]) index[day] = {};
                if (!index[day][hour]) index[day][hour] = {};
                for (const tId of teacherIds) {
                    if (tId) index[day][hour][tId] = classId;
                }
            }
        }
    }
    return index;
};

/**
 * Build simple lookup: classId -> className
 */
export const buildClassNameById = (classes: ClassType[] | undefined) => {
    const map: Record<string, string> = {};
    (classes || []).forEach((c) => {
        // Fallback to id if name is missing
        map[c.id] = (c as any).name || c.id;
    });
    return map;
};

/**
 * Build WeeklySchedule from AnnualScheduleType[]
 * Note: uses String(dayNumber) as the day key (e.g., "1".."7"); hour is also string.
 */
export const buildWeeklyScheduleFromAnnual = (rows: AnnualScheduleType[] | undefined) => {
    const schedule: WeeklySchedule = {};
    if (!rows || rows.length === 0) return schedule;

    for (const row of rows) {
        const classId = row.class?.id;
        const teacherId = row.teacher?.id;
        const subjectId = row.subject?.id;
        const dayKey = String(row.day);       // day as "1".."7"
        const hourKey = String(row.hour);     // hour as string

        if (!classId || !teacherId || !subjectId) continue;

        if (!schedule[classId]) schedule[classId] = {};
        if (!schedule[classId][dayKey]) schedule[classId][dayKey] = {};
        if (!schedule[classId][dayKey][hourKey]) {
            schedule[classId][dayKey][hourKey] = { teachers: [], subjects: [], classId };
        }

        const cell = schedule[classId][dayKey][hourKey];
        if (!cell.teachers.includes(teacherId)) cell.teachers.push(teacherId);
        if (!cell.subjects.includes(subjectId)) cell.subjects.push(subjectId);
    }

    return schedule;
};
