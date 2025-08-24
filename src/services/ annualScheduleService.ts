import { Pair } from "@/models/types";
import { AnnualScheduleRequest, WeeklySchedule } from "@/models/types/annualSchedule";
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
    if (!newSchedule[selectedClassId][day][hour]) {
        newSchedule[selectedClassId][day][hour] = { teachers: [], subjects: [] };
    }
    return newSchedule;
};

export const createRequests = (
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

export const getUniqueCells = (rows: AnnualScheduleRequest[] | undefined | null) => {
    console.log("rows", rows)
    if (!Array.isArray(rows)) return [];
    const uniqueKeys = new Set<string>();
    const uniqueCells: { day: number; hour: number }[] = [];
    for (const row of rows) {
        if (!row || typeof row.day !== 'number' || typeof row.hour !== 'number') continue;
        const key = `${row.day}:${row.hour}`;
        if (!uniqueKeys.has(key)) {
            uniqueKeys.add(key);
            uniqueCells.push({ day: row.day, hour: row.hour });
        }
    }
    return uniqueCells;
}