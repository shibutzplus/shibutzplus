// Pure in-memory scoring engine for automatic substitute assignment ("Magic Assign").
// Detailed algorithm documentation: docs/magic-assign.md

import { DailySchedule, DailyScheduleCell, ColumnTypeValues } from "@/models/types/dailySchedule";
import { TeacherType, TeacherRoleValues } from "@/models/types/teachers";
import { ClassType } from "@/models/types/classes";
import { AvailableTeachers, TeacherClassMap } from "@/models/types/annualSchedule";

export interface AutoSubstitutionCandidate {
    teacher: TeacherType;
    score: number;
    isCoTeacher?: boolean;
    reason?: string;
}

export interface AutoAssignSummaryItem {
    hour: number;
    columnTeacherName: string;
    subTeacherName: string;
    className?: string;
    subjectName?: string;
    reason: string;
    isReleased?: boolean;
    isUnassigned?: boolean;
    columnPosition?: number;
}

export interface AutoAssignOptions {
    dailySchedule: DailySchedule;
    selectedDate: string;
    teachers: TeacherType[];
    classes?: ClassType[];
    mapAvailableTeachers: AvailableTeachers;
    teacherClassMap: TeacherClassMap;
    systemRecommendations?: Record<string, Record<string, any[]>>;
    targetColumnId?: string;
    fromHour?: number;
    toHour?: number;
}

export interface AutoAssignResult {
    updatedSchedule: DailySchedule;
    assignedCount: number;
    unassignedCount: number;
    assignments: AutoAssignSummaryItem[];
}

export function getDayNumberFromDate(dateStr: string): number {
    if (!dateStr) return 1;
    const ddmmyyyy = dateStr.match(/^(\d{1,2})-(\d{1,2})-(\d{4})$/);
    if (ddmmyyyy) {
        const [, d, m, y] = ddmmyyyy;
        return new Date(Number(y), Number(m) - 1, Number(d)).getDay() + 1;
    }
    const yyyymmdd = dateStr.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
    if (yyyymmdd) {
        const [, y, m, d] = yyyymmdd;
        return new Date(Number(y), Number(m) - 1, Number(d)).getDay() + 1;
    }
    const parsed = new Date(dateStr);
    if (!isNaN(parsed.getTime())) {
        return parsed.getDay() + 1;
    }
    return 1;
}

const SCORE_WEIGHTS = {
    CO_TEACHER_IN_LESSON: 60,
    HISTORICAL_RECOMMENDATION_HIGH: 40,
    HISTORICAL_RECOMMENDATION_MED: 25,
    HISTORICAL_RECOMMENDATION_LOW: 10,
    NO_SCHEDULE_TEACHER: 35,
    EXISTING_PRESENT_TEACHER: 25,
    BLOCK_CONTINUITY_SAME_CLASS: 50,
    BLOCK_CONTINUITY_SAME_COLUMN: 28,
    BLOCK_CONTINUITY_DIFF_CLASS: 10,
    CLASS_FAMILIARITY: 30,
    AVAILABLE_WINDOW_HOUR: 25,
    DEDICATED_SUBSTITUTE: 20,
    FULL_DAY_SUB_CALL_BONUS: 45,
    MOBILIZED_SUB_BONUS: 20,
    DUAL_HOUR_AVAILABLE_BONUS: 20,
    DOUBLE_PERIOD_SAME_CLASS_BONUS: 35,
    DOUBLE_PERIOD_CONTINUITY_BONUS: 25,
    BLOCKED_NEXT_HOUR_PENALTY: 80,
    ON_CAMPUS_WORKING_DAY: 40,
    DAILY_LOAD_PENALTY: 12,
    ACTIVITY_GROUP_PENALTY: 20,
    MANAGEMENT_STAFF_PENALTY: 50,
    COUNSELING_STAFF_PENALTY: 40,
    SPECIAL_ROLE_STAFF_PENALTY: 35,
    UNCONFIRMED_SUB_CALL_PENALTY: 40,
    CONSECUTIVE_FATIGUE_PENALTY: 15,
    END_OF_DAY_PENALTY: 10,
    HOMEROOM_TEACHER_BURNOUT_PENALTY: 20,
    EARLY_ARRIVAL_FALLBACK_SCORE: 12,
    MIN_SCORE_LATE_HOUR: 30,
    MAX_DAILY_SUB_HOURS_REGULAR: 2,
    MIN_HOMEROOM_WEEKLY_HOURS: 7,
    MIN_EXTERNAL_VENDOR_WEEKLY_HOURS: 6,
};

function getGradeLevel(classes?: Array<{ name?: string }>): number {
    if (!classes || classes.length === 0) return 99;
    for (const cls of classes) {
        const name = cls.name || "";
        if (/(^|[^\u0590-\u05fe])(כיתה\s*)?א(['"״׳]?\s*[0-9]+|['"״׳]|$)/i.test(name)) return 1;
        if (/(^|[^\u0590-\u05fe])(כיתה\s*)?ב(['"״׳]?\s*[0-9]+|['"״׳]|$)/i.test(name)) return 2;
        if (/(^|[^\u0590-\u05fe])(כיתה\s*)?ג(['"״׳]?\s*[0-9]+|['"״׳]|$)/i.test(name)) return 3;
        if (/(^|[^\u0590-\u05fe])(כיתה\s*)?ד(['"״׳]?\s*[0-9]+|['"״׳]|$)/i.test(name)) return 4;
        if (/(^|[^\u0590-\u05fe])(כיתה\s*)?ה(['"״׳]?\s*[0-9]+|['"״׳]|$)/i.test(name)) return 5;
        if (/(^|[^\u0590-\u05fe])(כיתה\s*)?ו(['"״׳]?\s*[0-9]+|['"״׳]|$)/i.test(name)) return 6;
        if (/(^|[^\u0590-\u05fe])(כיתה\s*)?ז(['"״׳]?\s*[0-9]+|['"״׳]|$)/i.test(name)) return 7;
        if (/(^|[^\u0590-\u05fe])(כיתה\s*)?ח(['"״׳]?\s*[0-9]+|['"״׳]|$)/i.test(name)) return 8;
    }
    return 99;
}

function isUpperGrade(classes?: Array<{ name?: string }>): boolean {
    const level = getGradeLevel(classes);
    return level >= 4 && level <= 8;
}

function isActivityCell(
    cell?: DailyScheduleCell,
    activityClassIds?: Set<string>,
    activityClassNames?: Set<string>
): boolean {
    if (!cell) return false;
    const isClassActivity = cell.classes?.some(
        (cls) =>
            cls.activity === true ||
            (cls.id && activityClassIds?.has(cls.id)) ||
            (cls.name && activityClassNames?.has(cls.name.trim())) ||
            (cls.name && /^(פרטני|שהייה|שעת\s*סלים|שעת\s*תפקיד|קבוצת\s*לימוד|קבוצת\s*עבודה)$/i.test(cls.name.trim()))
    );
    const isSubjectActivity =
        !!cell.subject?.activity ||
        /^(פרטני|שהייה|שעת\s*סלים|שעת\s*תפקיד|מליאה)$/i.test(cell.subject?.name || "");
    return !!(isClassActivity || isSubjectActivity);
}

function isProtectedActivity(text?: string): boolean {
    if (!text) return false;
    const trimmed = text.trim();
    return /ניהול|סגנ|הנהלה|יעוץ|ייעוץ|פסיכולוג|טיפול|הדרכ|שיח\s*רגשי/i.test(trimmed);
}

function getColumnHeader(col?: Record<string, DailyScheduleCell>) {
    if (!col) return undefined;
    return Object.values(col).find((c) => c?.headerCol?.type !== undefined)?.headerCol;
}

interface AutoAssignContext {
    dayNumber: number;
    dayNumStr: string;
    fromHour: number;
    clonedDay: DailySchedule[string];
    eligibleCandidateTeachers: TeacherType[];
    existingPresentTeacherIds: Set<string>;
    teachesOnThisDay: Set<string>;
    mapAvailableTeachers: AvailableTeachers;
    teacherClassMap: TeacherClassMap;
    activityClassIds: Set<string>;
    activityClassNames: Set<string>;
    systemRecommendations: Record<string, Record<string, any[]>>;
    dailySubLoad: Map<string, number>;
    teacherStartEndMap: Map<string, { min: number; max: number }>;
    annualTeacherIds: Set<string>;
    teachersWithOnlyActivities: Set<string>;
    managementStaffIds: Set<string>;
    counselingStaffIds: Set<string>;
    specialRoleStaffIds: Set<string>;
    homeroomTeacherByClass: Map<string, string>;
    classNameMap: Map<string, string>;
}

export function autoAssignSubstitutes({
    dailySchedule,
    selectedDate,
    teachers,
    classes = [],
    mapAvailableTeachers,
    teacherClassMap,
    systemRecommendations = {},
    targetColumnId,
    fromHour = 1,
    toHour = 10,
}: AutoAssignOptions): AutoAssignResult {
    // Deep clone the day schedule to avoid mutating current state directly
    const daySchedule = dailySchedule[selectedDate];
    if (!daySchedule) {
        return { updatedSchedule: dailySchedule, assignedCount: 0, unassignedCount: 0, assignments: [] };
    }

    const assignments: AutoAssignSummaryItem[] = [];

    const clonedDay: DailySchedule[string] = {};
    Object.keys(daySchedule).forEach((colId) => {
        clonedDay[colId] = {};
        Object.keys(daySchedule[colId]).forEach((h) => {
            clonedDay[colId][h] = { ...daySchedule[colId][h] };
        });
    });

    const dayNumber = getDayNumberFromDate(selectedDate);
    const dayNumStr = String(dayNumber);

    const annualTeacherIds = new Set<string>();
    Object.values(mapAvailableTeachers || {}).forEach((hoursMap) => {
        Object.values(hoursMap || {}).forEach((ids) => {
            ids.forEach((id) => annualTeacherIds.add(id));
        });
    });

    const teacherStartEndMap = new Map<string, { min: number; max: number }>();
    const teachesOnThisDay = new Set<string>();
    const dayScheduleHours = mapAvailableTeachers[dayNumber] || mapAvailableTeachers[dayNumStr];
    if (dayScheduleHours) {
        Object.entries(dayScheduleHours).forEach(([hStr, tIds]) => {
            const hNum = parseInt(hStr, 10);
            if (!isNaN(hNum)) {
                tIds.forEach((id) => {
                    teachesOnThisDay.add(id);
                    const current = teacherStartEndMap.get(id) || { min: 24, max: -1 };
                    teacherStartEndMap.set(id, {
                        min: Math.min(current.min, hNum),
                        max: Math.max(current.max, hNum),
                    });
                });
            }
        });
    }

    const activityClassIds = new Set(
        (classes || []).filter((c) => c.activity).map((c) => c.id)
    );
    const activityClassNames = new Set<string>(
        (classes || []).filter((c) => c.activity).map((c) => c.name?.trim()).filter((n): n is string => n !== undefined)
    );

    const classNameMap = new Map<string, string>(
        (classes || []).map((c) => [c.id, c.name?.trim() || ""])
    );

    const missingTeacherIds = new Set<string>();
    const existingPresentTeacherIds = new Set<string>();

    const teachersWithOnlyActivities = new Set<string>();
    const managementStaffIds = new Set<string>();
    const counselingStaffIds = new Set<string>();
    const specialRoleStaffIds = new Set<string>();

    teachers.forEach((t) => {
        if (t.role !== TeacherRoleValues.REGULAR) return;
        const name = t.name?.trim() || "";
        if (/סגן|סגנית|מנהל|מנהלת/i.test(name)) managementStaffIds.add(t.id);
        if (/יועצ|יועצת|יעוץ|ייעוץ|פסיכולוג/i.test(name)) counselingStaffIds.add(t.id);
        if (/מדריכ|מדריך|סייע|משלב/i.test(name)) specialRoleStaffIds.add(t.id);

        let totalScheduledHours = 0;
        let activityHours = 0;
        let frontalHours = 0;
        let managementHours = 0;
        let counselingHours = 0;

        Object.values(teacherClassMap || {}).forEach((dayMap) => {
            Object.values(dayMap || {}).forEach((hourMap) => {
                const classId = hourMap[t.id];
                if (classId) {
                    totalScheduledHours++;
                    const cName = classNameMap.get(classId) || "";
                    const isAct = activityClassIds.has(classId);

                    if (/ניהול|סגנ|הנהלה/i.test(cName)) {
                        managementHours++;
                    }
                    if (/יעוץ|ייעוץ|פסיכולוג|טיפול/i.test(cName)) {
                        counselingHours++;
                    }

                    if (isAct) {
                        activityHours++;
                    } else {
                        frontalHours++;
                    }
                }
            });
        });

        if (managementHours >= 4) {
            managementStaffIds.add(t.id);
        }
        if (counselingHours >= 4) {
            counselingStaffIds.add(t.id);
        }

        if (totalScheduledHours > 0 && frontalHours === 0) {
            teachersWithOnlyActivities.add(t.id);
        }

        if (
            managementStaffIds.has(t.id) ||
            counselingStaffIds.has(t.id) ||
            (totalScheduledHours > 0 && (activityHours / totalScheduledHours >= 0.65 || frontalHours <= 5))
        ) {
            specialRoleStaffIds.add(t.id);
        }
    });

    const teacherActiveDays = new Map<string, { days: Set<string>; totalHours: number }>();
    Object.entries(mapAvailableTeachers || {}).forEach(([dStr, hoursObj]) => {
        Object.values(hoursObj || {}).forEach((tIds) => {
            tIds.forEach((id) => {
                if (!teacherActiveDays.has(id)) teacherActiveDays.set(id, { days: new Set(), totalHours: 0 });
                const entry = teacherActiveDays.get(id)!;
                entry.days.add(dStr);
                entry.totalHours++;
            });
        });
    });

    const externalVendorTeacherIds = new Set<string>();
    teachers.forEach((t) => {
        if (t.role !== TeacherRoleValues.REGULAR) return;
        const entry = teacherActiveDays.get(t.id);
        const daysCount = entry?.days.size || 0;
        const weeklyHours = entry?.totalHours || 0;
        // External programs/vendors/enrichment (Tal'an, external music, external clubs):
        // Active on only 1 single day of the week with <= MIN_EXTERNAL_VENDOR_WEEKLY_HOURS total weekly hours
        if (daysCount === 1 && weeklyHours <= SCORE_WEIGHTS.MIN_EXTERNAL_VENDOR_WEEKLY_HOURS) {
            externalVendorTeacherIds.add(t.id);
        }
    });

    // Calculate structural homeroom teacher per class:
    // The regular teacher who teaches the most frontal (non-activity) hours to this class across the week (minimum 7 hours).
    const classTeacherWeeklyFrontalHours = new Map<string, Map<string, number>>();
    Object.values(teacherClassMap || {}).forEach((dayMap) => {
        Object.values(dayMap || {}).forEach((hourMap) => {
            Object.entries(hourMap || {}).forEach(([tId, cId]) => {
                if (!cId || activityClassIds.has(cId)) return;
                if (!classTeacherWeeklyFrontalHours.has(cId)) {
                    classTeacherWeeklyFrontalHours.set(cId, new Map());
                }
                const counts = classTeacherWeeklyFrontalHours.get(cId)!;
                counts.set(tId, (counts.get(tId) || 0) + 1);
            });
        });
    });

    const homeroomTeacherByClass = new Map<string, string>();
    classTeacherWeeklyFrontalHours.forEach((teacherCounts, cId) => {
        let maxHours = 0;
        let bestTeacherId: string | null = null;
        teacherCounts.forEach((hours, tId) => {
            if (hours > maxHours) {
                maxHours = hours;
                bestTeacherId = tId;
            }
        });
        if (bestTeacherId && maxHours >= SCORE_WEIGHTS.MIN_HOMEROOM_WEEKLY_HOURS) {
            homeroomTeacherByClass.set(cId, bestTeacherId);
        }
    });

    Object.values(clonedDay).forEach((col) => {
        const headerCol = getColumnHeader(col);
        if (headerCol?.headerTeacher?.id) {
            if (headerCol.type === ColumnTypeValues.missingTeacher) {
                missingTeacherIds.add(headerCol.headerTeacher.id);
            } else if (headerCol.type === ColumnTypeValues.existingTeacher) {
                existingPresentTeacherIds.add(headerCol.headerTeacher.id);
            }
        }
    });

    const dailySubLoad = new Map<string, number>();
    Object.values(clonedDay).forEach((col) => {
        Object.values(col).forEach((cell) => {
            if (cell.subTeacher?.id) {
                dailySubLoad.set(cell.subTeacher.id, (dailySubLoad.get(cell.subTeacher.id) || 0) + 1);
            }
        });
    });

    // Pre-filter candidate teachers once for the entire day (skip staff, aides, missing teachers, external vendors)
    const eligibleCandidateTeachers = teachers.filter((t) => {
        if (t.role === TeacherRoleValues.STAFF) return false;
        const name = t.name?.trim() || "";
        if (/משלב|סייע/i.test(name)) return false;
        if (externalVendorTeacherIds.has(t.id)) return false;
        if (missingTeacherIds.has(t.id)) return false;
        return true;
    });

    const ctx: AutoAssignContext = {
        dayNumber,
        dayNumStr,
        fromHour,
        clonedDay,
        eligibleCandidateTeachers,
        existingPresentTeacherIds,
        teachesOnThisDay,
        mapAvailableTeachers,
        teacherClassMap,
        activityClassIds,
        activityClassNames,
        systemRecommendations,
        dailySubLoad,
        teacherStartEndMap,
        annualTeacherIds,
        teachersWithOnlyActivities,
        managementStaffIds,
        counselingStaffIds,
        specialRoleStaffIds,
        homeroomTeacherByClass,
        classNameMap,
    };

    const columnsToProcess = targetColumnId
        ? [targetColumnId]
        : Object.keys(clonedDay).filter((colId) => {
            const headerCol = getColumnHeader(clonedDay[colId]);
            return headerCol?.type === ColumnTypeValues.missingTeacher;
        });

    // Prioritize columns that teach younger grades in early hours (Grade 1-3 before Grade 5-6)
    if (!targetColumnId && columnsToProcess.length > 1) {
        const getColumnUrgency = (colId: string): number => {
            const col = clonedDay[colId];
            if (!col) return 99;
            let minGrade = 99;
            for (let h = fromHour; h <= Math.min(toHour, fromHour + 3); h++) {
                const cell = col[String(h)];
                if (cell?.classes && cell.classes.length > 0) {
                    const grade = getGradeLevel(cell.classes);
                    if (grade < minGrade) minGrade = grade;
                }
            }
            return minGrade;
        };

        columnsToProcess.sort((a, b) => getColumnUrgency(a) - getColumnUrgency(b));
    }

    let assignedCount = 0;
    let unassignedCount = 0;

    columnsToProcess.forEach((colId) => {
        const col = clonedDay[colId];
        if (!col) return;

        let missingLessonHoursInColumn = 0;
        for (let checkH = fromHour; checkH <= toHour; checkH++) {
            const checkCell = col[String(checkH)];
            if (!checkCell) continue;
            const isLesson = !!(checkCell.classes && checkCell.classes.length > 0);
            if (isLesson && !checkCell.subTeacher?.id && !checkCell.event) {
                missingLessonHoursInColumn++;
            }
        }
        const isFullDayAbsence = missingLessonHoursInColumn >= 4;

        const headerCol = getColumnHeader(col);
        const colPosition = headerCol?.position ?? 0;
        const originalTeacherName = headerCol?.headerTeacher?.name?.trim() || "";
        const originalTeacherId = headerCol?.headerTeacher?.id;

        for (let h = fromHour; h <= toHour; h++) {
            const hourStr = String(h);
            const cell = col[hourStr];
            if (!cell) continue;

            const isLessonSlot = !!(cell.classes && cell.classes.length > 0);
            if (!isLessonSlot) continue;
            if (cell.subTeacher?.id || cell.event) continue;

            const isActivity = isActivityCell(cell, activityClassIds, activityClassNames);
            if (isActivity) continue;

            const classIds = (cell.classes || []).map((c) => c.id);
            const isUpper = isUpperGrade(cell.classes);
            const gradeLevel = getGradeLevel(cell.classes);

            // For hour 6 and above:
            // Check if this lesson is part of a double period or agricultural farm (חווה חקלאית)
            // where the first half (hour h - 1) is being taught.
            // Rule: Never dismiss the second half alone without the first half!
            const prevCell = h > fromHour ? col[String(h - 1)] : undefined;
            const isPrevTaught =
                !!prevCell &&
                !!(prevCell.classes && prevCell.classes.length > 0) &&
                (!!prevCell.subTeacher?.id || (!!prevCell.event && prevCell.event !== "משוחררים"));

            const isSameClassAsPrev = prevCell?.classes?.some((pc) => classIds.includes(pc.id));
            const isAgricultureFarm =
                (cell.subject?.name && /חווה|חקלא/i.test(cell.subject.name)) ||
                cell.classes?.some((c) => /חווה|חקלא/i.test(c.name || "")) ||
                (prevCell?.subject?.name && /חווה|חקלא/i.test(prevCell.subject.name)) ||
                prevCell?.classes?.some((c) => /חווה|חקלא/i.test(c.name || ""));

            const isDoublePeriodOrFarmWithPrev = !!(isPrevTaught && (isSameClassAsPrev || isAgricultureFarm));

            // Find the best substitute candidate (returns null if below required score threshold)
            const candidate = findBestCandidate({
                ctx,
                hour: h,
                columnId: colId,
                originalTeacherName,
                originalTeacherId,
                classIds,
                isUpperGrade: isUpper,
                isFullDayAbsence,
                isDoublePeriodOrFarmWithPrev,
            });

            const classNamesStr = (cell.classes || []).map((c) => c.name).filter(Boolean).join(", ");
            const subjectName = cell.subject?.name;

            if (h >= 6) {
                if (gradeLevel <= 3 || isDoublePeriodOrFarmWithPrev) {
                    // Up to Grade 3, OR continuation of a double period / agricultural farm where the first half is taught:
                    // Prefer assigning a substitute teacher
                    if (candidate) {
                        cell.subTeacher = candidate.teacher;
                        cell.event = undefined;
                        assignedCount++;
                        dailySubLoad.set(candidate.teacher.id, (dailySubLoad.get(candidate.teacher.id) || 0) + 1);
                        assignments.push({
                            hour: h,
                            columnTeacherName: originalTeacherName,
                            subTeacherName: candidate.teacher.name,
                            className: classNamesStr,
                            subjectName,
                            reason: candidate.reason || "שיבוץ אופטימלי",
                            columnPosition: colPosition,
                        });
                    } else if (isDoublePeriodOrFarmWithPrev) {
                        // Double period / farm cannot dismiss the 2nd half alone! Leave unassigned for principal review
                        unassignedCount++;
                        assignments.push({
                            hour: h,
                            columnTeacherName: originalTeacherName,
                            subTeacherName: "לא נמצא שיבוץ מתאים",
                            className: classNamesStr,
                            subjectName,
                            reason: "לא נמצא שיבוץ מתאים",
                            isUnassigned: true,
                            columnPosition: colPosition,
                        });
                    } else {
                        // Fallback to dismissal if no substitute can be found (for lower grades)
                        if (!cell.event) {
                            cell.event = "משוחררים";
                            assignedCount++;
                            assignments.push({
                                hour: h,
                                columnTeacherName: originalTeacherName,
                                subTeacherName: "משוחררים",
                                className: classNamesStr,
                                subjectName,
                                reason: "שחרור כיתה (סוף יום)",
                                isReleased: true,
                                columnPosition: colPosition,
                            });
                        }
                    }
                } else {
                    // Grade 4 and above standalone late hour: dismiss unless there is a co-teacher already in this lesson
                    if (candidate?.isCoTeacher) {
                        cell.subTeacher = candidate.teacher;
                        cell.event = undefined;
                        assignedCount++;
                        dailySubLoad.set(candidate.teacher.id, (dailySubLoad.get(candidate.teacher.id) || 0) + 1);
                        assignments.push({
                            hour: h,
                            columnTeacherName: originalTeacherName,
                            subTeacherName: candidate.teacher.name,
                            className: classNamesStr,
                            subjectName,
                            reason: candidate.reason || "מורה נוסף/ת באותו שיעור",
                            columnPosition: colPosition,
                        });
                    } else {
                        if (!cell.event) {
                            cell.event = "משוחררים";
                            assignedCount++;
                            assignments.push({
                                hour: h,
                                columnTeacherName: originalTeacherName,
                                subTeacherName: "משוחררים",
                                className: classNamesStr,
                                subjectName,
                                reason: "שחרור כיתה (סוף יום)",
                                isReleased: true,
                                columnPosition: colPosition,
                            });
                        }
                    }
                }
            } else {
                if (candidate) {
                    cell.subTeacher = candidate.teacher;
                    cell.event = undefined;
                    assignedCount++;
                    dailySubLoad.set(candidate.teacher.id, (dailySubLoad.get(candidate.teacher.id) || 0) + 1);
                    assignments.push({
                        hour: h,
                        columnTeacherName: originalTeacherName,
                        subTeacherName: candidate.teacher.name,
                        className: classNamesStr,
                        subjectName,
                        reason: candidate.reason || "שיבוץ אופטימלי",
                        columnPosition: colPosition,
                    });
                } else {
                    unassignedCount++;
                    assignments.push({
                        hour: h,
                        columnTeacherName: originalTeacherName,
                        subTeacherName: "לא נמצא שיבוץ מתאים",
                        className: classNamesStr,
                        subjectName,
                        reason: "לא נמצא שיבוץ מתאים",
                        isUnassigned: true,
                        columnPosition: colPosition,
                    });
                }
            }
        }
    });

    assignments.sort((a, b) => (a.columnPosition ?? 0) - (b.columnPosition ?? 0) || a.hour - b.hour);

    return {
        updatedSchedule: {
            ...dailySchedule,
            [selectedDate]: clonedDay,
        },
        assignedCount,
        unassignedCount,
        assignments,
    };
}

interface CandidateSearchParams {
    ctx: AutoAssignContext;
    hour: number;
    columnId: string;
    originalTeacherName: string;
    originalTeacherId?: string;
    classIds: string[];
    isUpperGrade: boolean;
    isFullDayAbsence: boolean;
    isDoublePeriodOrFarmWithPrev: boolean;
}

function findBestCandidate(params: CandidateSearchParams): AutoSubstitutionCandidate | null {
    const {
        ctx,
        hour,
        columnId,
        originalTeacherName,
        originalTeacherId,
        classIds,
        isUpperGrade,
        isFullDayAbsence,
        isDoublePeriodOrFarmWithPrev,
    } = params;

    const {
        dayNumber,
        dayNumStr,
        fromHour,
        clonedDay,
        eligibleCandidateTeachers,
        existingPresentTeacherIds,
        teachesOnThisDay,
        mapAvailableTeachers,
        teacherClassMap,
        activityClassIds,
        activityClassNames,
        systemRecommendations,
        dailySubLoad,
        teacherStartEndMap,
        annualTeacherIds,
        teachersWithOnlyActivities,
        managementStaffIds,
        counselingStaffIds,
        specialRoleStaffIds,
        homeroomTeacherByClass,
        classNameMap,
    } = ctx;

    const hourStr = String(hour);
    const scheduledTeacherIds = new Set([
        ...(mapAvailableTeachers[dayNumber]?.[hourStr] || []),
        ...(mapAvailableTeachers[dayNumStr]?.[hourStr] || []),
    ]);

    const dailyOccupiedTeacherIds = new Set<string>();
    Object.values(clonedDay).forEach((col) => {
        const cell = col[hourStr];
        if (cell?.subTeacher?.id) {
            dailyOccupiedTeacherIds.add(cell.subTeacher.id);
        }
        const headerCol = getColumnHeader(col);
        if (
            headerCol?.type === ColumnTypeValues.existingTeacher &&
            headerCol.headerTeacher?.id
        ) {
            const isActivity = isActivityCell(cell, activityClassIds, activityClassNames);
            const isCoveredBySub = !!cell?.subTeacher?.id;
            const cellClassNames = (cell?.classes || []).map((c) => c.name || "").join(" ");
            const cellSubjectName = cell?.subject?.name || "";
            const isProtected = isProtectedActivity(cellClassNames) || isProtectedActivity(cellSubjectName);
            if (cell?.event || isProtected || (!isActivity && !isCoveredBySub && cell?.classes && cell.classes.length > 0)) {
                dailyOccupiedTeacherIds.add(headerCol.headerTeacher.id);
            }
        }
    });

    const prevHourStr = String(hour - 1);
    const nextHourStr = String(hour + 1);
    const prevCell = clonedDay[columnId]?.[prevHourStr];
    const nextCell = clonedDay[columnId]?.[nextHourStr];
    const prevSubId = prevCell?.subTeacher?.id;
    const nextSubId = nextCell?.subTeacher?.id;

    const recMap = new Map<string, number>();
    const recList = (systemRecommendations as any)?.[hourStr]?.[originalTeacherName] || [];
    recList.forEach((item: any) => {
        if (typeof item === "string") {
            recMap.set(item.trim(), 1);
        } else if (item && typeof item === "object" && item.name) {
            recMap.set(item.name.trim(), item.count || 1);
        }
    });

    const classIdsSet = new Set(classIds);
    const isOriginalTeacherTheHomeroom = originalTeacherId
        ? Array.from(classIdsSet).some((cId) => homeroomTeacherByClass.get(cId) === originalTeacherId)
        : false;

    const candidates: AutoSubstitutionCandidate[] = [];

    for (const teacher of eligibleCandidateTeachers) {
        if (originalTeacherId && teacher.id === originalTeacherId) continue;
        if (dailyOccupiedTeacherIds.has(teacher.id)) continue;

        const teacherName = teacher.name?.trim() || "";
        const isScheduledThisHour = scheduledTeacherIds.has(teacher.id);
        const teachesToday = teachesOnThisDay.has(teacher.id);
        const bounds = teacherStartEndMap.get(teacher.id);
        const isPresentInBlueColumn = existingPresentTeacherIds.has(teacher.id);

        // Hard constraints: Never summon teachers from home who are not currently active in school
        if (teacher.role === TeacherRoleValues.REGULAR && !isPresentInBlueColumn) {
            // Free day: Has lessons in annual schedule, but none today
            if (!teachesToday && annualTeacherIds.has(teacher.id)) {
                continue;
            }
            // No annual schedule: Only allow dormant 0-hour records if recommended by history
            if (!annualTeacherIds.has(teacher.id)) {
                const hasRecommendation = teacherName ? recMap.has(teacherName) : false;
                if (!hasRecommendation) {
                    continue;
                }
            }
            // Not started yet: hour is before their first lesson today (teacher is at home)
            if (teachesToday && bounds && hour < bounds.min) {
                // Allow arriving 1 hour early (hour === bounds.min - 1) as a penalized option, but strictly block 2+ hours early
                if (hour < bounds.min - 1) {
                    continue;
                }
            }
            // Already finished: hour is after their last lesson today (teacher went home)
            if (teachesToday && bounds && hour > bounds.max) {
                continue;
            }
        }

        let teachingActivityGroup = false;

        const teachingClassId = teacherClassMap[dayNumStr]?.[hourStr]?.[teacher.id];
        const isCoTeacherInLesson = !!(teachingClassId && classIdsSet.has(teachingClassId));

        // Allow continuing a double period / agricultural farm even if at 2 daily hours limit
        const isContinuingDoublePeriod =
            isDoublePeriodOrFarmWithPrev && prevSubId !== undefined && prevSubId === teacher.id;

        // Hard constraint: Maximum 2 daily substitution hours for regular teachers with a schedule (prevent teacher fatigue)
        const currentSubLoad = dailySubLoad.get(teacher.id) || 0;
        const isRegularWithSchedule =
            teacher.role === TeacherRoleValues.REGULAR && annualTeacherIds.has(teacher.id);
        if (
            isRegularWithSchedule &&
            currentSubLoad >= SCORE_WEIGHTS.MAX_DAILY_SUB_HOURS_REGULAR &&
            !isCoTeacherInLesson &&
            !isContinuingDoublePeriod
        ) {
            continue;
        }

        if (isScheduledThisHour && !isCoTeacherInLesson && !isContinuingDoublePeriod) {
            const isActivity = teachingClassId ? activityClassIds.has(teachingClassId) : false;
            if (!isActivity) {
                continue;
            }
            const currentClassName = teachingClassId ? classNameMap.get(teachingClassId) || "" : "";
            if (isProtectedActivity(currentClassName)) {
                // Strictly protect management (ניהול/סגנות), counseling (ייעוץ), therapy (טיפול), and guidance (הדרכה)
                continue;
            }
            teachingActivityGroup = true;
        }

        let score = 0;

        // Bonus: Continuing double period / agricultural farm from previous hour
        if (isContinuingDoublePeriod) {
            score += SCORE_WEIGHTS.DOUBLE_PERIOD_SAME_CLASS_BONUS + SCORE_WEIGHTS.DOUBLE_PERIOD_CONTINUITY_BONUS;
        }

        // Bonus: Co-teacher already assigned to this lesson
        if (isCoTeacherInLesson) {
            score += SCORE_WEIGHTS.CO_TEACHER_IN_LESSON;
        }

        // Penalty: Currently teaching an activity / small group
        if (teachingActivityGroup) {
            score -= SCORE_WEIGHTS.ACTIVITY_GROUP_PENALTY;
        }

        // Fallback: Teacher has not started their workday yet (calling in early from home)
        const isArrivingOneHourEarly =
            teachesToday && bounds && hour === bounds.min - 1 && !isPresentInBlueColumn;
        if (isArrivingOneHourEarly) {
            score += SCORE_WEIGHTS.EARLY_ARRIVAL_FALLBACK_SCORE;
        }

        // Bonus: Historical substitution recommendation pattern
        const histCount = teacherName ? recMap.get(teacherName) : undefined;
        if (histCount !== undefined) {
            if (histCount >= 4) {
                score += SCORE_WEIGHTS.HISTORICAL_RECOMMENDATION_HIGH;
            } else if (histCount >= 2) {
                score += SCORE_WEIGHTS.HISTORICAL_RECOMMENDATION_MED;
            } else {
                score += SCORE_WEIGHTS.HISTORICAL_RECOMMENDATION_LOW;
            }
        }

        // Consecutive lesson load fatigue penalty:
        let priorConsecutiveHours = 0;
        for (let prevH = hour - 1; prevH >= 1; prevH--) {
            const classId = teacherClassMap[dayNumStr]?.[String(prevH)]?.[teacher.id];
            const isScheduledFrontal = !!(classId && !activityClassIds.has(classId));
            const isSubbingPrev = Object.values(clonedDay).some(
                (c) => c[String(prevH)]?.subTeacher?.id === teacher.id
            );
            if (isScheduledFrontal || isSubbingPrev) {
                priorConsecutiveHours++;
            } else {
                break;
            }
        }

        if (priorConsecutiveHours >= 3) {
            score -= SCORE_WEIGHTS.CONSECUTIVE_FATIGUE_PENALTY;
        }

        let consecutiveSubHours = 0;
        for (let backH = hour - 1; backH >= fromHour; backH--) {
            if (clonedDay[columnId]?.[String(backH)]?.subTeacher?.id === teacher.id) {
                consecutiveSubHours++;
            } else {
                break;
            }
        }

        // Bonus: Block continuity with previous or next substituted hour
        const isAdjacentSub = (prevSubId && teacher.id === prevSubId) || (nextSubId && teacher.id === nextSubId);
        if (isAdjacentSub) {
            const isSameClassWithPrev = prevSubId && teacher.id === prevSubId && prevCell?.classes?.some((c) => classIdsSet.has(c.id));
            const isSameClassWithNext = nextSubId && teacher.id === nextSubId && nextCell?.classes?.some((c) => classIdsSet.has(c.id));

            if (consecutiveSubHours >= 2) {
                score += SCORE_WEIGHTS.BLOCK_CONTINUITY_DIFF_CLASS;
            } else if (isSameClassWithPrev || isSameClassWithNext) {
                score += SCORE_WEIGHTS.BLOCK_CONTINUITY_SAME_CLASS;
            } else {
                score += SCORE_WEIGHTS.BLOCK_CONTINUITY_SAME_COLUMN;
            }
        }

        // Multi-hour and double period lookahead:
        // If the next hour in this column is also a lesson slot needing a substitute,
        // evaluate whether this candidate can continue or will cause a disruption.
        const isNextHourActivity = isActivityCell(nextCell, activityClassIds, activityClassNames);

        const isNextHourLesson =
            hour + 1 < 6 &&
            !!nextCell &&
            !!(nextCell.classes && nextCell.classes.length > 0) &&
            !isNextHourActivity;
        const isNextHourMissing = isNextHourLesson && !nextCell.subTeacher?.id && !nextCell.event;

        if (isNextHourMissing && !isArrivingOneHourEarly) {
            const nextCellHasSameClass = nextCell?.classes?.some((c) => classIdsSet.has(c.id));

            // Check if teacher has a frontal (non-activity) annual schedule lesson in the next hour
            const nextHourClassId = teacherClassMap[dayNumStr]?.[nextHourStr]?.[teacher.id];
            const isScheduledFrontalNextHour = !!(nextHourClassId && !activityClassIds.has(nextHourClassId));

            // Check if teacher is already assigned as a sub in another column in the next hour
            const isNextHourOccupiedDaily = Object.values(clonedDay).some(
                (c) => c[nextHourStr]?.subTeacher?.id === teacher.id
            );

            // Check if teacher would exceed daily limit in the next hour
            const wouldBeCappedNextHour =
                isRegularWithSchedule &&
                currentSubLoad + 1 >= SCORE_WEIGHTS.MAX_DAILY_SUB_HOURS_REGULAR &&
                !nextCellHasSameClass; // Allowed to extend for double period in same class

            if (isScheduledFrontalNextHour || isNextHourOccupiedDaily || wouldBeCappedNextHour) {
                // Penalty: Cannot continue into next hour (breaks double period or block continuity)
                const penalty = nextCellHasSameClass ? SCORE_WEIGHTS.BLOCKED_NEXT_HOUR_PENALTY : 10;
                score -= penalty;
            } else {
                // Bonus: Available for consecutive hours (double period or block)
                if (nextCellHasSameClass) {
                    score += SCORE_WEIGHTS.DOUBLE_PERIOD_SAME_CLASS_BONUS;
                } else {
                    score += SCORE_WEIGHTS.DUAL_HOUR_AVAILABLE_BONUS;
                }
            }
        }

        let teachesTargetClass = false;
        const classMapForDay = teacherClassMap[dayNumStr];
        if (classMapForDay) {
            Object.values(classMapForDay).forEach((hourMap) => {
                if (hourMap[teacher.id] && classIdsSet.has(hourMap[teacher.id])) {
                    teachesTargetClass = true;
                }
            });
        }

        // Structural homeroom teacher protection:
        // Do not burnout homeroom teachers in their own homeroom class during their windows/planning
        const isHomeroomOfTargetClass = Array.from(classIdsSet).some(
            (cId) => homeroomTeacherByClass.get(cId) === teacher.id
        );

        if (isHomeroomOfTargetClass && !isOriginalTeacherTheHomeroom) {
            // Penalty: Protect homeroom teacher from burnout in own class during planning time
            score -= SCORE_WEIGHTS.HOMEROOM_TEACHER_BURNOUT_PENALTY;
        } else if (teachesTargetClass && !counselingStaffIds.has(teacher.id) && !managementStaffIds.has(teacher.id)) {
            // Bonus: Teacher is familiar with this specific class (not applicable to counselors or management)
            score += SCORE_WEIGHTS.CLASS_FAMILIARITY;
        }

        // Bonus: Teacher is already present today in the schedule (has a blue column)
        if (existingPresentTeacherIds.has(teacher.id)) {
            score += SCORE_WEIGHTS.EXISTING_PRESENT_TEACHER;
        }

        // Teacher without fixed annual schedule or activity-only
        const isActivityOnlyTeacher = teachersWithOnlyActivities.has(teacher.id);
        const isNoScheduleTeacher =
            teacher.role === TeacherRoleValues.REGULAR &&
            !annualTeacherIds.has(teacher.id) &&
            !existingPresentTeacherIds.has(teacher.id);

        if (isNoScheduleTeacher) {
            score += SCORE_WEIGHTS.NO_SCHEDULE_TEACHER;
            score += SCORE_WEIGHTS.AVAILABLE_WINDOW_HOUR;
        }

        // Dedicated staff roles protection:
        // School management (ניהול/סגנות) and counseling (יועצות/פסיכולוגים) have essential
        // administrative and mental health responsibilities and must not be routinely used for classroom substitution.
        if (managementStaffIds.has(teacher.id)) {
            score -= SCORE_WEIGHTS.MANAGEMENT_STAFF_PENALTY;
        } else if (counselingStaffIds.has(teacher.id)) {
            score -= SCORE_WEIGHTS.COUNSELING_STAFF_PENALTY;
        } else if (specialRoleStaffIds.has(teacher.id) || isActivityOnlyTeacher) {
            score -= SCORE_WEIGHTS.SPECIAL_ROLE_STAFF_PENALTY;
        }

        const isCurrentlyActiveOnCampus =
            isPresentInBlueColumn ||
            (teachesToday && bounds && hour >= bounds.min && hour <= bounds.max);

        // Bonus: Regular teacher free during a window hour in their active workday
        if (!isScheduledThisHour && isCurrentlyActiveOnCampus && teacher.role === TeacherRoleValues.REGULAR) {
            score += SCORE_WEIGHTS.AVAILABLE_WINDOW_HOUR;
        }

        // Penalty: Teacher was about to finish their workday (prefer mid-day windows over delaying departure)
        const isEndOfWorkday =
            teachesToday && bounds && bounds.max > bounds.min && hour === bounds.max && (!isPresentInBlueColumn || isRegularWithSchedule);
        if (isEndOfWorkday) {
            score -= SCORE_WEIGHTS.END_OF_DAY_PENALTY;
        }

        // Dedicated substitute role scoring
        if (teacher.role === TeacherRoleValues.SUBSTITUTE) {
            if (isCurrentlyActiveOnCampus) {
                // Bonus: Dedicated sub already on campus
                score += SCORE_WEIGHTS.DEDICATED_SUBSTITUTE;
            } else {
                if (isFullDayAbsence) {
                    // Bonus: Full-day absence justifies calling in external substitute pool
                    score += SCORE_WEIGHTS.FULL_DAY_SUB_CALL_BONUS;
                } else {
                    // Penalty: Unconfirmed sub at home for single hour
                    score -= SCORE_WEIGHTS.UNCONFIRMED_SUB_CALL_PENALTY;
                }
            }
        }

        // Bonus: Active on campus during today's working hours
        if (isCurrentlyActiveOnCampus) {
            score += SCORE_WEIGHTS.ON_CAMPUS_WORKING_DAY;
        }

        // Load balancing: Prefer mobilizing an already-active sub (up to 2 hrs) or penalize excessive daily load
        const currentLoad = dailySubLoad.get(teacher.id) || 0;
        if (currentLoad === 1 && isRegularWithSchedule) {
            score += SCORE_WEIGHTS.MOBILIZED_SUB_BONUS;
        } else if (currentLoad > 0) {
            score -= currentLoad * SCORE_WEIGHTS.DAILY_LOAD_PENALTY;
        }

        let candidateReason = "זמינות במערכת והתאמה גבוהה";
        if (isContinuingDoublePeriod) {
            candidateReason = "המשכיות שיעור כפול";
        } else if (isCoTeacherInLesson) {
            candidateReason = "מורה נוסף/ת באותו שיעור";
        } else if (isArrivingOneHourEarly) {
            candidateReason = "הגעה מוקדמת מהבית בהיעדר מורה פנוי בביה\"ס";
        } else if (isAdjacentSub) {
            candidateReason = "רצף שעות ושמירה על יציבות הכיתה";
        } else if (isPresentInBlueColumn) {
            let blueColumnCell: DailyScheduleCell | undefined;
            for (const col of Object.values(clonedDay)) {
                const hCol = getColumnHeader(col);
                if (
                    hCol?.type === ColumnTypeValues.existingTeacher &&
                    hCol.headerTeacher?.id === teacher.id
                ) {
                    blueColumnCell = col[hourStr];
                    break;
                }
            }

            const isActivityAtThisHour =
                isActivityCell(blueColumnCell, activityClassIds, activityClassNames) ||
                (teachingClassId ? activityClassIds.has(teachingClassId) : false) ||
                teachingActivityGroup ||
                isActivityOnlyTeacher;

            let otherClassName = "";
            if (blueColumnCell?.classes && blueColumnCell.classes.length > 0) {
                otherClassName = blueColumnCell.classes
                    .map((c) => c.name?.trim())
                    .filter(Boolean)
                    .join(", ");
            } else if (teachingClassId) {
                otherClassName = classNameMap.get(teachingClassId) || "";
            }

            if (isActivityAtThisHour) {
                candidateReason = "מורה נוכח/ת בקבוצת לימוד/עבודה";
            } else if (otherClassName) {
                candidateReason = `מורה נוכח/ת בכיתה אחרת (${otherClassName})`;
            } else if (!annualTeacherIds.has(teacher.id) || isNoScheduleTeacher) {
                candidateReason = 'מורה נוכח/ת בביה"ס (ללא מערכת קבועה)';
            } else {
                candidateReason = "מורה נוכח/ת ופנוי/ה בשעה זו (חלון במערכת)";
            }
        } else if (!isScheduledThisHour && isCurrentlyActiveOnCampus && teacher.role === TeacherRoleValues.REGULAR) {
            candidateReason = "ניצול חלון במערכת השעות";
        } else if (isActivityOnlyTeacher || isNoScheduleTeacher) {
            candidateReason = isActivityOnlyTeacher
                ? "מורה נוכח/ת בקבוצת לימוד/עבודה"
                : 'מורה נוכח/ת בביה"ס (ללא מערכת קבועה)';
        } else if (teacher.role === TeacherRoleValues.SUBSTITUTE) {
            candidateReason = "מורה מחליפ/ה";
        } else if (teachesTargetClass) {
            candidateReason = "מכיר/ה את הכיתה וזמינ/ה במערכת";
        }

        candidates.push({
            teacher,
            score,
            isCoTeacher: isCoTeacherInLesson,
            reason: candidateReason,
        });
    }

    if (candidates.length === 0) return null;

    candidates.sort((a, b) => b.score - a.score);
    const topCandidate = candidates[0];

    const lateHourThreshold = isUpperGrade ? 6 : 7;
    const minThreshold = hour >= lateHourThreshold ? SCORE_WEIGHTS.MIN_SCORE_LATE_HOUR : 0;
    if (topCandidate.score < minThreshold) {
        return null;
    }

    return topCandidate;
}
