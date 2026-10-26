/**
 * ============================================================================
 * INDIVIDUAL TUTORING ("פרטני") CLASS FILTER
 * ============================================================================
 * 
 * PURPOSE:
 * When a principal sets a teacher's lesson to "פרטני" (individual tutoring),
 * the class dropdown suggests only relevant classes for this teacher.
 * 
 * HOW THE FILTER WORKS:
 * 
 * 1. Matching Subject:
 *    At this specific day and hour, the class must be learning a subject
 *    that this teacher teaches (for example, Math).
 * 
 * 2. Teacher Age Group Profile:
 *    The class must fit the grade levels the teacher normally teaches:
 *    - Grades 1-6  (א-ו)
 *    - Grades 7-12 (ז-יב)
 *    If the teacher only teaches grades 1-6, only grades 1-6 are shown.
 *    If the teacher teaches both 1-6 and 7-12, both groups are shown.
 * 
 * 3. Real Classes Only:
 *    Only regular homeroom classes are suggested (activity groups are skipped).
 * 
 * 4. Fallback if no profile match:
 *    If no matching class was identified for this hour based on the teacher's profile,
 *    all organic classes studying at this hour are shown with their subject: כיתה (מקצוע).
 * 
 * 5. Fallback if no classes study at this hour:
 *    If no classes are studying at this hour (e.g. late hour 7), all organic homeroom
 *    classes in the school are shown, indicating in parentheses when each finished: כיתה (סיימה בשעה X).
 * 
 * 6. Always Include "פרטני":
 *    The "פרטני" option is always shown in the dropdown.
 * ============================================================================
 */

import { AnnualScheduleType, WeeklySchedule } from "@/models/types/annualSchedule";
import { ClassType } from "@/models/types/classes";
import { SubjectType } from "@/models/types/subjects";
import { SelectOption } from "@/models/types";
import { DAYS_OF_WEEK, DAYS_OF_WORK_WEEK } from "@/utils/time";
import { compareHebrew } from "@/utils/sort";

export type GradeGroup = "A_TO_V" | "Z_TO_YB";

/**
 * Extracts numeric grade level (1-12) from a class name.
 */
export const getClassGradeLevel = (className?: string): number => {
    if (!className) return 0;
    const name = className.trim();
    // Check multi-letter grades (יב, יא) before single letter (י)
    if (/(^|[^\u0590-\u05fe])(כיתה\s*)?יב(['"״׳]?\s*[0-9]+|['"״׳]|$)/i.test(name)) return 12;
    if (/(^|[^\u0590-\u05fe])(כיתה\s*)?יא(['"״׳]?\s*[0-9]+|['"״׳]|$)/i.test(name)) return 11;
    if (/(^|[^\u0590-\u05fe])(כיתה\s*)?י(['"״׳]?\s*[0-9]+|['"״׳]|$)/i.test(name)) return 10;
    if (/(^|[^\u0590-\u05fe])(כיתה\s*)?ט(['"״׳]?\s*[0-9]+|['"״׳]|$)/i.test(name)) return 9;
    if (/(^|[^\u0590-\u05fe])(כיתה\s*)?ח(['"״׳]?\s*[0-9]+|['"״׳]|$)/i.test(name)) return 8;
    if (/(^|[^\u0590-\u05fe])(כיתה\s*)?ז(['"״׳]?\s*[0-9]+|['"״׳]|$)/i.test(name)) return 7;
    if (/(^|[^\u0590-\u05fe])(כיתה\s*)?ו(['"״׳]?\s*[0-9]+|['"״׳]|$)/i.test(name)) return 6;
    if (/(^|[^\u0590-\u05fe])(כיתה\s*)?ה(['"״׳]?\s*[0-9]+|['"״׳]|$)/i.test(name)) return 5;
    if (/(^|[^\u0590-\u05fe])(כיתה\s*)?ד(['"״׳]?\s*[0-9]+|['"״׳]|$)/i.test(name)) return 4;
    if (/(^|[^\u0590-\u05fe])(כיתה\s*)?ג(['"״׳]?\s*[0-9]+|['"״׳]|$)/i.test(name)) return 3;
    if (/(^|[^\u0590-\u05fe])(כיתה\s*)?ב(['"״׳]?\s*[0-9]+|['"״׳]|$)/i.test(name)) return 2;
    if (/(^|[^\u0590-\u05fe])(כיתה\s*)?א(['"״׳]?\s*[0-9]+|['"״׳]|$)/i.test(name)) return 1;
    return 0;
};

/**
 * Returns the grade group:
 * - 1..6: 'A_TO_V' (א-ו)
 * - 7..12: 'Z_TO_YB' (ז-יב)
 */
export const getGradeGroup = (gradeLevel: number): GradeGroup | null => {
    if (gradeLevel >= 1 && gradeLevel <= 6) return "A_TO_V";
    if (gradeLevel >= 7 && gradeLevel <= 12) return "Z_TO_YB";
    return null;
};

export type TutoringMatchedClass = {
    classObj: ClassType;
    subjectName?: string;
};

export type TutoringSlotClassesMap = {
    [day: string]: {
        [hour: number]: TutoringMatchedClass[];
    };
};

/**
 * Precomputes for each (day, hour) slot all organic classes in the school:
 * - Active classes at this slot are sorted primarily by active subject name, then by class name.
 * - Inactive classes (finished earlier or not studying) appear at the end.
 */
export const buildTeacherTutoringSlotClassesMap = (
    selectedTeacherId?: string,
    annualScheduleTable?: AnnualScheduleType[] | undefined,
    schedule?: WeeklySchedule | undefined,
    classes?: ClassType[] | undefined,
    subjects?: SubjectType[] | undefined
): TutoringSlotClassesMap => {
    const result: TutoringSlotClassesMap = {};

    if (!classes || classes.length === 0) {
        return result;
    }

    const classMap = new Map<string, ClassType>();
    classes.forEach((c) => classMap.set(c.id, c));

    const subjectMap = new Map<string, SubjectType>();
    (subjects || []).forEach((s) => subjectMap.set(s.id, s));

    const activitySubjectIds = new Set(
        (subjects || []).filter((s) => s.activity || s.name?.includes("פרטני")).map((s) => s.id)
    );

    const isTutoringName = (name?: string) => {
        if (!name) return false;
        const trimmed = name.trim();
        return trimmed === "פרטני" || trimmed.includes("פרטני");
    };

    // allSlotClassMap: [dayChar][hour] -> Map<classId, { subjectName?: string; isActivity: boolean }>
    const allSlotClassMap = new Map<string, Map<number, Map<string, { subjectName?: string; isActivity: boolean }>>>();

    // classEndHoursByDay: [dayChar][classId] -> maxHour
    const classEndHoursByDay: Record<string, Record<string, number>> = {};
    let maxHourInSchool = 10;

    if (annualScheduleTable) {
        annualScheduleTable.forEach((entry) => {
            const dayChar = DAYS_OF_WEEK[entry.day - 1];
            if (!dayChar) return;

            const cId = entry.classId || entry.class?.id;
            if (!cId) return;

            const cls = classMap.get(cId);
            // Only organic homeroom classes
            if (!cls || cls.activity) return;

            if (entry.hour > maxHourInSchool) {
                maxHourInSchool = entry.hour;
            }

            // Track when this class finishes on this day
            if (!classEndHoursByDay[dayChar]) {
                classEndHoursByDay[dayChar] = {};
            }
            const currentMax = classEndHoursByDay[dayChar][cls.id] || 0;
            if (entry.hour > currentMax) {
                classEndHoursByDay[dayChar][cls.id] = entry.hour;
            }

            const sId = entry.subjectId || entry.subject?.id;
            const isActivity = sId ? activitySubjectIds.has(sId) : false;
            const subjectName = sId ? subjectMap.get(sId)?.name : undefined;
            const isTutoring = isTutoringName(subjectName);

            // Populate allSlotClassMap (all organic classes active at this hour with regular subjects)
            if (!isTutoring) {
                if (!allSlotClassMap.has(dayChar)) {
                    allSlotClassMap.set(dayChar, new Map());
                }
                const allDayMap = allSlotClassMap.get(dayChar)!;
                if (!allDayMap.has(entry.hour)) {
                    allDayMap.set(entry.hour, new Map());
                }
                const allHourMap = allDayMap.get(entry.hour)!;

                const existingAll = allHourMap.get(cls.id);
                if (!existingAll) {
                    allHourMap.set(cls.id, { subjectName, isActivity });
                } else {
                    // Prefer regular subject over activity subject
                    if (existingAll.isActivity && !isActivity) {
                        allHourMap.set(cls.id, { subjectName, isActivity });
                    } else if (
                        !existingAll.isActivity &&
                        !isActivity &&
                        subjectName &&
                        existingAll.subjectName &&
                        !existingAll.subjectName.includes(subjectName)
                    ) {
                        allHourMap.set(cls.id, {
                            subjectName: `${existingAll.subjectName}, ${subjectName}`,
                            isActivity: false,
                        });
                    }
                }
            }
        });
    }

    const organicClasses = classes
        .filter((c) => !c.activity && c.name?.trim() !== "פרטני" && !c.name?.includes("פרטני"));

    // Populate result for each day and hour
    const daysToCover = DAYS_OF_WORK_WEEK;
    const hoursToCover = Math.max(10, maxHourInSchool);

    daysToCover.forEach((dayChar) => {
        result[dayChar] = {};

        for (let hour = 1; hour <= hoursToCover; hour++) {
            const hourSlotMap = allSlotClassMap.get(dayChar)?.get(hour);

            const activeClasses: TutoringMatchedClass[] = [];
            const inactiveClasses: TutoringMatchedClass[] = [];

            organicClasses.forEach((cls) => {
                const info = hourSlotMap?.get(cls.id);
                if (info?.subjectName) {
                    activeClasses.push({
                        classObj: cls,
                        subjectName: info.subjectName,
                    });
                } else {
                    const endHour = classEndHoursByDay[dayChar]?.[cls.id];
                    let subLabel: string;
                    if (!endHour) {
                        subLabel = "לא לומדת ביום זה";
                    } else if (hour > endHour) {
                        subLabel = `סיימה בשעה ${endHour}`;
                    } else {
                        subLabel = `סיום בשעה ${endHour}`;
                    }
                    inactiveClasses.push({
                        classObj: cls,
                        subjectName: subLabel,
                    });
                }
            });

            // 1. Sort active classes by subjectName ascending (Hebrew), then by class name
            activeClasses.sort((a, b) => {
                const subDiff = compareHebrew(a.subjectName || "", b.subjectName || "");
                if (subDiff !== 0) return subDiff;
                return compareHebrew(a.classObj.name, b.classObj.name);
            });

            // 2. Sort inactive classes by class name
            inactiveClasses.sort((a, b) => compareHebrew(a.classObj.name, b.classObj.name));

            // Combined list: all active classes sorted by subject, followed by inactive classes
            result[dayChar][hour] = [...activeClasses, ...inactiveClasses];
        }
    });

    return result;
};

/**
 * Returns the SelectOption items for an individual tutoring ("פרטני") cell.
 * Includes "פרטני", the matching organic classes for that slot (with subLabel set to subjectName),
 * all other classes in the school, and any currently selected classes.
 */
export const getTutoringCellClassSelectOptions = (
    day: string,
    hour: number,
    tutoringSlotClassesMap: TutoringSlotClassesMap | null,
    classes: ClassType[] | undefined,
    currentSelectedClassIds: string[] = []
): SelectOption[] => {
    if (!classes || classes.length === 0) return [];

    const isTutoringName = (name?: string) => {
        if (!name) return false;
        const trimmed = name.trim();
        return trimmed === "פרטני" || trimmed.includes("פרטני");
    };

    const tutoringClasses = classes.filter(
        (c) => c.name?.trim() === "פרטני" || c.name?.includes("פרטני")
    );

    const matchedClasses = tutoringSlotClassesMap?.[day]?.[hour] || [];

    const options: SelectOption[] = [];
    const addedIds = new Set<string>();

    // 1. Always include the "פרטני" class at the top (no subLabel)
    tutoringClasses.forEach((c) => {
        if (!addedIds.has(c.id)) {
            options.push({ value: c.id, label: c.name });
            addedIds.add(c.id);
        }
    });

    // 2. Add prioritized matching organic classes (and subsequently other organic classes with their subjects)
    matchedClasses.forEach(({ classObj, subjectName }) => {
        if (!addedIds.has(classObj.id)) {
            options.push({
                value: classObj.id,
                label: classObj.name,
                subLabel: isTutoringName(subjectName) ? undefined : subjectName,
            });
            addedIds.add(classObj.id);
        }
    });

    // 3. Only append remaining organic homeroom classes (exclude activity/study groups like הדרכת הורים, מליאה, צוותים)
    classes
        .filter((cls) => !cls.activity && !isTutoringName(cls.name))
        .sort((a, b) => compareHebrew(a.name, b.name))
        .forEach((cls) => {
            if (!addedIds.has(cls.id)) {
                options.push({
                    value: cls.id,
                    label: cls.name,
                });
                addedIds.add(cls.id);
            }
        });

    // 4. Keep any currently selected classes in this cell so labels show properly
    currentSelectedClassIds.forEach((cId) => {
        if (!addedIds.has(cId)) {
            const cls = classes.find((c) => c.id === cId);
            if (cls) {
                options.push({ value: cls.id, label: cls.name });
                addedIds.add(cls.id);
            }
        }
    });

    return options;
};
