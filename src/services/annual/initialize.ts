import { Pair } from "@/models/types";
import { AnnualScheduleRequest, WeeklySchedule } from "@/models/types/annualSchedule";
import { ClassType } from "@/models/types/classes";
import { SchoolType } from "@/models/types/school";
import { SubjectType } from "@/models/types/subjects";
import { TeacherType } from "@/models/types/teachers";
import { DAYS_OF_WEEK, dayToNumber } from "@/utils/time";

export const initializeEmptyAnnualSchedule = (
    newSchedule: WeeklySchedule,
    selectedClassId: string,
    fromHour: number = 1,
    toHour: number = 10,
) => {
    // Initialize empty schedule structure
    newSchedule[selectedClassId] = {};
    DAYS_OF_WEEK.forEach((day) => {
        newSchedule[selectedClassId][day] = {};

        for (let hour = fromHour; hour <= toHour; hour++) {
            newSchedule[selectedClassId][day][hour] = {
                teachers: [],
                subjects: [],
                classes: [],
            };
        }
    });
    return newSchedule;
};

export const setNewScheduleTemplate = (
    newSchedule: WeeklySchedule,
    selectedId: string,
    day: string,
    hour: number,
    defaultTeacher?: string,
    defaultClass?: string,
) => {
    // If there is no cell, create template one
    if (!newSchedule[selectedId]) {
        newSchedule[selectedId] = {};
    }
    if (!newSchedule[selectedId][day]) {
        newSchedule[selectedId][day] = {};
    }
    if (!newSchedule[selectedId][day][hour]) {
        newSchedule[selectedId][day][hour] = {
            teachers: defaultTeacher ? [defaultTeacher] : [],
            classes: defaultClass ? [defaultClass] : [],
            subjects: [],
        };
    }
    return newSchedule;
};

export const createAnnualByClassRequests = (
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

export const createAnnualByTeacherRequests = (
    selectedTeacherObj: TeacherType | undefined,
    school: SchoolType | undefined,
    classes: ClassType[] | undefined,
    subjects: SubjectType[] | undefined,
    pairs: Pair[],
    day: string,
    hour: number,
) => {
    const requests: AnnualScheduleRequest[] = [];
    for (const pair of pairs) {
        if (!selectedTeacherObj || !school) continue;
        const classObj = classes?.find((c) => c.id === pair[0]);
        const subject = subjects?.find((s) => s.id === pair[1]);
        if (!classObj || !subject) continue;
        const request: AnnualScheduleRequest = {
            day: dayToNumber(day),
            hour: hour,
            school: school,
            class: classObj,
            teacher: selectedTeacherObj,
            subject: subject,
        };
        requests.push(request);
    }
    return requests;
};

export const createTeacherSubjectPairs = (teacherIds: string[], subjectIds: string[]) => {
    const res: Pair[] = [];
    const lastTwoIdx = subjectIds.length - 1;
    for (let i = 0; i < teacherIds.length; i++) {
        const j = i < subjectIds.length ? i : lastTwoIdx;
        res.push([teacherIds[i], subjectIds[j]]);
    }
    return res;
};

export const createClassSubjectPairs = (classIds: string[], subjectIds: string[]) => {
    const res: Pair[] = [];
    const lastTwoIdx = subjectIds.length - 1;
    for (let i = 0; i < classIds.length; i++) {
        const j = i < subjectIds.length ? i : lastTwoIdx;
        res.push([classIds[i], subjectIds[j]]);
    }
    return res;
};
