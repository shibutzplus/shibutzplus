import { Pair } from "@/models/types";
import { AnnualScheduleRequest, WeeklySchedule } from "@/models/types/annualSchedule";
import { ClassType } from "@/models/types/classes";
import { SchoolType } from "@/models/types/school";
import { SubjectType } from "@/models/types/subjects";
import { TeacherType } from "@/models/types/teachers";
import { DAYS_OF_WEEK, dayToNumber, HOURS_IN_DAY } from "@/utils/time";

export const initializeEmptyAnnualSchedule = (
    newSchedule: WeeklySchedule,
    selectedClassId: string,
    totalHours: number,
) => {
    // Initialize empty schedule structure
    newSchedule[selectedClassId] = {};
    DAYS_OF_WEEK.forEach((day) => {
        newSchedule[selectedClassId][day] = {};

        for (let hour = 1; hour <= totalHours; hour++) {
            newSchedule[selectedClassId][day][hour] = {
                teachers: [],
                subjects: [],
            };
        }
    });
    return newSchedule;
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
        newSchedule[selectedClassId][day][hour] = {
            teachers: [],
            subjects: [],
            classId: selectedClassId,
        };
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
