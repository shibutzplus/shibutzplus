import { AnnualScheduleType } from "@/models/types/annualSchedule";
import { ClassType } from "@/models/types/classes";
import { SubjectType } from "@/models/types/subjects";
import { TeacherType } from "@/models/types/teachers";
import { compareHebrew } from "@/utils/sort";

export type TeacherSubjectClassDetail = {
    classId: string;
    className: string;
    hours: number;
};

export type TeacherSubjectBreakdown = {
    subjectId: string;
    subjectName: string;
    totalHours: number;
    classes: TeacherSubjectClassDetail[];
};

export type TeacherScheduleStats = {
    teacherId: string;
    teacherName: string;
    frontalHours: number;
    totalHours: number;
    subjectsBreakdown: TeacherSubjectBreakdown[];
};

export type ClassSubjectBreakdown = {
    subjectId: string;
    subjectName: string;
    hours: number;
};

export type ClassTeacherDetail = {
    teacherId: string;
    teacherName: string;
    subjects: string[];
    hours: number;
};

export type ClassScheduleStats = {
    classId: string;
    className: string;
    totalHours: number;
    subjectsBreakdown: ClassSubjectBreakdown[];
    teachersTeam: ClassTeacherDetail[];
};

const isTutoringSubject = (subjectName?: string): boolean => {
    if (!subjectName) return false;
    const trimmed = subjectName.trim();
    return trimmed === "פרטני" || trimmed.includes("פרטני");
};

/**
 * Calculates schedule statistics for a single teacher based on annualScheduleTable.
 */
export const calculateTeacherScheduleStats = (
    teacherId: string,
    annualScheduleTable: AnnualScheduleType[] | undefined,
    teachers: TeacherType[] | undefined,
    classes: ClassType[] | undefined,
    subjects: SubjectType[] | undefined
): TeacherScheduleStats | null => {
    if (!teacherId) return null;

    const teacher = (teachers || []).find((t) => t.id === teacherId);
    const teacherName = teacher?.name || "מורה";

    const classMap = new Map<string, ClassType>();
    (classes || []).forEach((c) => classMap.set(c.id, c));

    const subjectMap = new Map<string, SubjectType>();
    (subjects || []).forEach((s) => subjectMap.set(s.id, s));

    // Filter all entries for this teacher
    const teacherEntries = (annualScheduleTable || []).filter((entry) => {
        const tId = entry.teacherId || entry.teacher?.id;
        return tId === teacherId;
    });

    // 1. Group by (day, hour) slot to determine frontal vs tutoring and total unique teaching hours
    // slotKey: `${entry.day}-${entry.hour}` -> entries in this slot
    const slotsMap = new Map<string, AnnualScheduleType[]>();

    teacherEntries.forEach((entry) => {
        const slotKey = `${entry.day}-${entry.hour}`;
        if (!slotsMap.has(slotKey)) {
            slotsMap.set(slotKey, []);
        }
        slotsMap.get(slotKey)!.push(entry);
    });

    let frontalHours = 0;

    slotsMap.forEach((entriesInSlot) => {
        const hasTutoring = entriesInSlot.some((e) => {
            const sId = e.subjectId || e.subject?.id;
            const s = sId ? subjectMap.get(sId) : undefined;
            const cId = e.classId || e.class?.id;
            const cls = cId ? classMap.get(cId) : undefined;
            return isTutoringSubject(s?.name) || cls?.name?.includes("פרטני");
        });

        if (hasTutoring) {
            return;
        }

        // Frontal teaching: must be a non-activity subject and non-activity (organic) class
        const isFrontal = entriesInSlot.some((e) => {
            const sId = e.subjectId || e.subject?.id;
            const s = sId ? subjectMap.get(sId) : undefined;
            const cId = e.classId || e.class?.id;
            const cls = cId ? classMap.get(cId) : undefined;

            const isSubjectActivity = Boolean(s?.activity);
            const isClassActivity = Boolean(cls?.activity);

            return !isSubjectActivity && !isClassActivity;
        });

        if (isFrontal) {
            frontalHours++;
        }
    });

    const totalHours = slotsMap.size;

    // 2. Subjects and Classes Breakdown
    // subjectId -> Map<classId, Set<slotKey>>
    const subjectClassSlots = new Map<string, Map<string, Set<string>>>();
    const subjectSlots = new Map<string, Set<string>>();

    teacherEntries.forEach((entry) => {
        const sId = entry.subjectId || entry.subject?.id || "unknown";
        const cId = entry.classId || entry.class?.id || "unknown";
        const slotKey = `${entry.day}-${entry.hour}`;

        if (!subjectSlots.has(sId)) {
            subjectSlots.set(sId, new Set());
        }
        subjectSlots.get(sId)!.add(slotKey);

        if (!subjectClassSlots.has(sId)) {
            subjectClassSlots.set(sId, new Map());
        }
        const classMapForSubject = subjectClassSlots.get(sId)!;
        if (!classMapForSubject.has(cId)) {
            classMapForSubject.set(cId, new Set());
        }
        classMapForSubject.get(cId)!.add(slotKey);
    });

    const subjectsBreakdown: TeacherSubjectBreakdown[] = Array.from(subjectSlots.entries())
        .map(([sId, slots]) => {
            const subject = subjectMap.get(sId);
            const subjectName = subject?.name || (sId === "unknown" ? "ללא מקצוע" : "מקצוע");

            const classMapForSubject = subjectClassSlots.get(sId) || new Map();
            const classesDetail: TeacherSubjectClassDetail[] = Array.from(classMapForSubject.entries())
                .filter(([cId]) => {
                    const cls = classMap.get(cId);
                    return cls ? !cls.activity : false;
                })
                .map(([cId, cSlots]) => {
                    const cls = classMap.get(cId);
                    const className = cls?.name || (cId === "unknown" ? "ללא כיתה" : "כיתה");
                    return {
                        classId: cId,
                        className,
                        hours: cSlots.size,
                    };
                })
                .sort((a, b) => compareHebrew(a.className, b.className));

            return {
                subjectId: sId,
                subjectName,
                totalHours: slots.size,
                classes: classesDetail,
            };
        })
        .sort((a, b) => {
            const isActivityA = Boolean(subjectMap.get(a.subjectId)?.activity) || a.classes.length === 0;
            const isActivityB = Boolean(subjectMap.get(b.subjectId)?.activity) || b.classes.length === 0;

            if (isActivityA !== isActivityB) {
                return isActivityA ? 1 : -1;
            }
            if (b.totalHours !== a.totalHours) {
                return b.totalHours - a.totalHours;
            }
            return compareHebrew(a.subjectName, b.subjectName);
        });

    return {
        teacherId,
        teacherName,
        frontalHours,
        totalHours,
        subjectsBreakdown,
    };
};

/**
 * Calculates schedule statistics for a single class based on annualScheduleTable.
 */
export const calculateClassScheduleStats = (
    classId: string,
    annualScheduleTable: AnnualScheduleType[] | undefined,
    classes: ClassType[] | undefined,
    teachers: TeacherType[] | undefined,
    subjects: SubjectType[] | undefined
): ClassScheduleStats | null => {
    if (!classId) return null;

    const cls = (classes || []).find((c) => c.id === classId);
    if (cls?.activity) return null;
    const className = cls?.name || "כיתה";

    const teacherMap = new Map<string, TeacherType>();
    (teachers || []).forEach((t) => teacherMap.set(t.id, t));

    const subjectMap = new Map<string, SubjectType>();
    (subjects || []).forEach((s) => subjectMap.set(s.id, s));

    // Filter all entries for this class
    const classEntries = (annualScheduleTable || []).filter((entry) => {
        const cId = entry.classId || entry.class?.id;
        return cId === classId;
    });

    // 1. Total weekly study hours (unique day, hour slots)
    const classSlots = new Set<string>();
    classEntries.forEach((entry) => {
        classSlots.add(`${entry.day}-${entry.hour}`);
    });
    const totalHours = classSlots.size;

    // 2. Curriculum breakdown: subject -> Set<slotKey>
    const subjectSlots = new Map<string, Set<string>>();
    classEntries.forEach((entry) => {
        const sId = entry.subjectId || entry.subject?.id || "unknown";
        const slotKey = `${entry.day}-${entry.hour}`;
        if (!subjectSlots.has(sId)) {
            subjectSlots.set(sId, new Set());
        }
        subjectSlots.get(sId)!.add(slotKey);
    });

    const subjectsBreakdown: ClassSubjectBreakdown[] = Array.from(subjectSlots.entries())
        .map(([sId, slots]) => {
            const subject = subjectMap.get(sId);
            const subjectName = subject?.name || (sId === "unknown" ? "ללא מקצוע" : "מקצוע");
            return {
                subjectId: sId,
                subjectName,
                hours: slots.size,
            };
        })
        .sort((a, b) => {
            const isActivityA = Boolean(subjectMap.get(a.subjectId)?.activity);
            const isActivityB = Boolean(subjectMap.get(b.subjectId)?.activity);
            if (isActivityA !== isActivityB) {
                return isActivityA ? 1 : -1;
            }
            if (b.hours !== a.hours) {
                return b.hours - a.hours;
            }
            return compareHebrew(a.subjectName, b.subjectName);
        });

    // 3. Teachers team: teacherId -> { slots: Set<slotKey>, subjectNames: Set<string> }
    const teacherDataMap = new Map<string, { slots: Set<string>; subjectNames: Set<string> }>();

    classEntries.forEach((entry) => {
        const tId = entry.teacherId || entry.teacher?.id;
        if (!tId) return;

        const slotKey = `${entry.day}-${entry.hour}`;
        const sId = entry.subjectId || entry.subject?.id;
        const sName = sId ? subjectMap.get(sId)?.name : undefined;

        if (!teacherDataMap.has(tId)) {
            teacherDataMap.set(tId, { slots: new Set(), subjectNames: new Set() });
        }
        const data = teacherDataMap.get(tId)!;
        data.slots.add(slotKey);
        if (sName) {
            data.subjectNames.add(sName);
        }
    });

    const teachersTeam: ClassTeacherDetail[] = Array.from(teacherDataMap.entries())
        .map(([tId, data]) => {
            const t = teacherMap.get(tId);
            const teacherName = t?.name || "מורה";
            return {
                teacherId: tId,
                teacherName,
                subjects: Array.from(data.subjectNames),
                hours: data.slots.size,
            };
        })
        .sort((a, b) => b.hours - a.hours || compareHebrew(a.teacherName, b.teacherName));

    return {
        classId,
        className,
        totalHours,
        subjectsBreakdown,
        teachersTeam,
    };
};
