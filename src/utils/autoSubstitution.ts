// Pure in-memory engine for automatic substitute assignment ("Magic Assign").
//
// Algorithm: Tiered priority — hard exclusions first, then category tier, then tie-breakers within tier.
//
// PRIORITY TIERS (lower = wins):
//   0 – CONTINUATION:    Continuing a double period in the same column, OR co-teacher in this exact lesson
//   1 – FREE_WINDOW:     Regular teacher on campus with a free window this hour
//   2 – ACTIVITY_GROUP:  Regular teacher on campus currently teaching a non-frontal activity/group
//   3 – SUB_ON_CAMPUS:   Dedicated substitute already on campus
//   4 – SUB_CALL_IN:     Dedicated substitute called in from home (full-day absence only)
//   5 – PROTECTED_STAFF: Management / counseling — absolute last resort
//
// TIE-BREAKERS within a tier (higher = better):
//   +3  Familiar with the target class
//   +2  High historical recommendation (≥4 times)
//   +1  Any historical recommendation
//   +1  Adjacent sub continuity (same teacher subbed prev/next hour in same column)
//   −1  Per substitution hour already assigned today (load balancing)
//   −3  Homeroom teacher of target class (burnout protection)
//
// HARD EXCLUSIONS (never even scored):
//   • Teacher is on a free day / hasn't started / already finished their day
//   • Teacher is currently in a frontal lesson (unless co-teacher)
//   • Teacher is already assigned as substitute elsewhere this hour
//   • Regular teacher with annual schedule exceeded MAX_DAILY_SUB_HOURS today
//   • Protected activity (management, counseling, therapy) — hard skip

import { DailySchedule, DailyScheduleCell, ColumnTypeValues } from "@/models/types/dailySchedule";
import { TeacherType, TeacherRoleValues } from "@/models/types/teachers";
import { ClassType } from "@/models/types/classes";
import { AvailableTeachers, TeacherClassMap } from "@/models/types/annualSchedule";
import type { SystemRecommendationsMap } from "@/app/actions/GET/getSystemRecommendationsAction";

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
    systemRecommendations?: SystemRecommendationsMap;
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

// ─── Configuration ─────────────────────────────────────────────────────────────
const MAX_DAILY_SUB_HOURS = 3;           // Max sub hours per day for regular scheduled teachers
const MIN_HOMEROOM_WEEKLY_HOURS = 7;     // Min weekly frontal hours to qualify as homeroom teacher
const MIN_EXTERNAL_VENDOR_WEEKLY_HOURS = 6; // Max total weekly hours for single-day external vendor detection

// Tier constants — lower number = higher priority
const TIER_CONTINUATION = 0;    // Double-period continuation or co-teacher in this lesson
const TIER_FREE_WINDOW = 1;     // On campus, free this hour
const TIER_ACTIVITY_GROUP = 2;  // On campus, teaching a non-frontal activity/group this hour
const TIER_SUB_ON_CAMPUS = 3;   // Dedicated substitute already on campus
const TIER_SUB_CALL_IN = 4;     // Dedicated substitute from home (full-day absence only)
const TIER_PROTECTED_STAFF = 5; // Management / counseling — last resort only

// Score encoding: (5 - tier) * 100 + tieBreaker
// Tier 0 → ~500, Tier 1 → ~400, ..., Tier 5 → ~0
// ──────────────────────────────────────────────────────────────────────────────

// ─── Helper functions ──────────────────────────────────────────────────────────

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
    return /ניהול|סגנ|הנהלה|יעוץ|ייעוץ|פסיכולוג|טיפול|הדרכ|שיח\s*רגשי/i.test(text.trim());
}

function getColumnHeader(col?: Record<string, DailyScheduleCell>) {
    if (!col) return undefined;
    return Object.values(col).find((c) => c?.headerCol?.type !== undefined)?.headerCol;
}

// ──────────────────────────────────────────────────────────────────────────────

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
    systemRecommendations: SystemRecommendationsMap;
    dailySubLoad: Map<string, number>;
    teacherStartEndMap: Map<string, { min: number; max: number }>;
    annualTeacherIds: Set<string>;
    managementStaffIds: Set<string>;
    counselingStaffIds: Set<string>;
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
    const daySchedule = dailySchedule[selectedDate];
    if (!daySchedule) {
        return { updatedSchedule: dailySchedule, assignedCount: 0, unassignedCount: 0, assignments: [] };
    }

    const assignments: AutoAssignSummaryItem[] = [];

    // Deep clone the day schedule to avoid mutating current state
    const clonedDay: DailySchedule[string] = {};
    Object.keys(daySchedule).forEach((colId) => {
        clonedDay[colId] = {};
        Object.keys(daySchedule[colId]).forEach((h) => {
            clonedDay[colId][h] = { ...daySchedule[colId][h] };
        });
    });

    const dayNumber = getDayNumberFromDate(selectedDate);
    const dayNumStr = String(dayNumber);

    // Build set of all teachers appearing in the annual schedule
    const annualTeacherIds = new Set<string>();
    Object.values(mapAvailableTeachers || {}).forEach((hoursMap) => {
        Object.values(hoursMap || {}).forEach((ids) => ids.forEach((id) => annualTeacherIds.add(id)));
    });

    // Build per-teacher workday start/end bounds for today
    const teacherStartEndMap = new Map<string, { min: number; max: number }>();
    const teachesOnThisDay = new Set<string>();
    const dayScheduleHours = mapAvailableTeachers[dayNumber] || mapAvailableTeachers[dayNumStr];
    if (dayScheduleHours) {
        Object.entries(dayScheduleHours).forEach(([hStr, tIds]) => {
            const hNum = parseInt(hStr, 10);
            if (!isNaN(hNum)) {
                tIds.forEach((id) => {
                    teachesOnThisDay.add(id);
                    const cur = teacherStartEndMap.get(id) || { min: 24, max: -1 };
                    teacherStartEndMap.set(id, { min: Math.min(cur.min, hNum), max: Math.max(cur.max, hNum) });
                });
            }
        });
    }

    const activityClassIds = new Set((classes || []).filter((c) => c.activity).map((c) => c.id));
    const activityClassNames = new Set<string>(
        (classes || []).filter((c) => c.activity).map((c) => c.name?.trim()).filter((n): n is string => n !== undefined)
    );
    const classNameMap = new Map<string, string>((classes || []).map((c) => [c.id, c.name?.trim() || ""]));

    const missingTeacherIds = new Set<string>();
    const existingPresentTeacherIds = new Set<string>();

    // Identify management and counseling staff by name
    const managementStaffIds = new Set<string>();
    const counselingStaffIds = new Set<string>();
    teachers.forEach((t) => {
        if (t.role !== TeacherRoleValues.REGULAR) return;
        const name = t.name?.trim() || "";
        if (/סגן|סגנית|מנהל|מנהלת/i.test(name)) managementStaffIds.add(t.id);
        if (/יועצ|יועצת|יעוץ|ייעוץ|פסיכולוג/i.test(name)) counselingStaffIds.add(t.id);
    });
    // Also identify by schedule: ≥4 management or counseling lesson hours in the annual schedule
    teachers.forEach((t) => {
        if (t.role !== TeacherRoleValues.REGULAR) return;
        let mgmtHours = 0;
        let counselHours = 0;
        Object.values(teacherClassMap || {}).forEach((dayMap) => {
            Object.values(dayMap || {}).forEach((hourMap) => {
                const cId = hourMap[t.id];
                if (!cId) return;
                const cName = classNameMap.get(cId) || "";
                if (/ניהול|סגנ|הנהלה/i.test(cName)) mgmtHours++;
                if (/יעוץ|ייעוץ|פסיכולוג|טיפול/i.test(cName)) counselHours++;
            });
        });
        if (mgmtHours >= 4) managementStaffIds.add(t.id);
        if (counselHours >= 4) counselingStaffIds.add(t.id);
    });

    // Identify single-day external vendors (active only 1 day/week with few total hours)
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
        if ((entry?.days.size || 0) === 1 && (entry?.totalHours || 0) <= MIN_EXTERNAL_VENDOR_WEEKLY_HOURS) {
            externalVendorTeacherIds.add(t.id);
        }
    });

    // Identify structural homeroom teacher per class:
    // The regular teacher with the most frontal weekly hours for that class (minimum MIN_HOMEROOM_WEEKLY_HOURS).
    const classTeacherFrontalHours = new Map<string, Map<string, number>>();
    Object.values(teacherClassMap || {}).forEach((dayMap) => {
        Object.values(dayMap || {}).forEach((hourMap) => {
            Object.entries(hourMap || {}).forEach(([tId, cId]) => {
                if (!cId || activityClassIds.has(cId)) return;
                if (!classTeacherFrontalHours.has(cId)) classTeacherFrontalHours.set(cId, new Map());
                const counts = classTeacherFrontalHours.get(cId)!;
                counts.set(tId, (counts.get(tId) || 0) + 1);
            });
        });
    });
    const homeroomTeacherByClass = new Map<string, string>();
    classTeacherFrontalHours.forEach((teacherCounts, cId) => {
        let maxH = 0;
        let bestId: string | null = null;
        teacherCounts.forEach((h, tId) => { if (h > maxH) { maxH = h; bestId = tId; } });
        if (bestId && maxH >= MIN_HOMEROOM_WEEKLY_HOURS) homeroomTeacherByClass.set(cId, bestId);
    });

    // Collect missing and present teacher IDs from column headers
    Object.values(clonedDay).forEach((col) => {
        const hdr = getColumnHeader(col);
        if (!hdr?.headerTeacher?.id) return;
        if (hdr.type === ColumnTypeValues.missingTeacher) missingTeacherIds.add(hdr.headerTeacher.id);
        else if (hdr.type === ColumnTypeValues.existingTeacher) existingPresentTeacherIds.add(hdr.headerTeacher.id);
    });

    // Track how many sub hours each teacher has been assigned today (updated after each assignment)
    const dailySubLoad = new Map<string, number>();
    Object.values(clonedDay).forEach((col) => {
        Object.values(col).forEach((cell) => {
            if (cell.subTeacher?.id) {
                dailySubLoad.set(cell.subTeacher.id, (dailySubLoad.get(cell.subTeacher.id) || 0) + 1);
            }
        });
    });

    // Pre-filter: exclude staff aides, external vendors, and the missing teacher themselves
    const eligibleCandidateTeachers = teachers.filter((t) => {
        if (t.role === TeacherRoleValues.STAFF) return false;
        if (/משלב|סייע/i.test(t.name?.trim() || "")) return false;
        if (externalVendorTeacherIds.has(t.id)) return false;
        if (missingTeacherIds.has(t.id)) return false;
        return true;
    });

    const ctx: AutoAssignContext = {
        dayNumber, dayNumStr, fromHour, clonedDay,
        eligibleCandidateTeachers, existingPresentTeacherIds, teachesOnThisDay,
        mapAvailableTeachers, teacherClassMap, activityClassIds, activityClassNames,
        systemRecommendations, dailySubLoad, teacherStartEndMap, annualTeacherIds,
        managementStaffIds, counselingStaffIds, homeroomTeacherByClass, classNameMap,
    };

    // Determine which columns to process
    const columnsToProcess = targetColumnId
        ? [targetColumnId]
        : Object.keys(clonedDay).filter((colId) => {
            const hdr = getColumnHeader(clonedDay[colId]);
            return hdr?.type === ColumnTypeValues.missingTeacher;
        });

    // Prioritize columns with younger grades first (Grade 1-3 before Grade 4+)
    if (!targetColumnId && columnsToProcess.length > 1) {
        const getColumnUrgency = (colId: string): number => {
            const col = clonedDay[colId];
            if (!col) return 99;
            let minGrade = 99;
            for (let h = fromHour; h <= Math.min(toHour, fromHour + 3); h++) {
                const cell = col[String(h)];
                if (cell?.classes?.length) minGrade = Math.min(minGrade, getGradeLevel(cell.classes));
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

        // Count missing lesson hours to determine if this is a full-day absence
        let missingLessonHours = 0;
        for (let h = fromHour; h <= toHour; h++) {
            const checkCell = col[String(h)];
            if (checkCell?.classes?.length && !checkCell.subTeacher?.id && !checkCell.event) {
                missingLessonHours++;
            }
        }
        const isFullDayAbsence = missingLessonHours >= 4;

        const hdr = getColumnHeader(col);
        const colPosition = hdr?.position ?? 0;
        const originalTeacherName = hdr?.headerTeacher?.name?.trim() || "";
        const originalTeacherId = hdr?.headerTeacher?.id;

        for (let h = fromHour; h <= toHour; h++) {
            const hourStr = String(h);
            const cell = col[hourStr];
            if (!cell) continue;
            if (!cell.classes?.length) continue;       // Not a lesson slot
            if (cell.subTeacher?.id || cell.event) continue; // Already handled
            if (isActivityCell(cell, activityClassIds, activityClassNames)) continue; // Activity slot — skip

            const classIds = (cell.classes || []).map((c) => c.id);
            const gradeLevel = getGradeLevel(cell.classes);

            // Detect double-period / agricultural farm continuity:
            // If the previous hour was taught (sub or event), and it's the same class or a farm,
            // the current hour must not be left alone.
            const prevCell = h > fromHour ? col[String(h - 1)] : undefined;
            const isPrevTaught =
                !!prevCell?.classes?.length &&
                (!!prevCell.subTeacher?.id || (!!prevCell.event && prevCell.event !== "משוחררים"));
            const isSameClassAsPrev = prevCell?.classes?.some((pc) => classIds.includes(pc.id));
            const isAgricultureFarm =
                (cell.subject?.name && /חווה|חקלא/i.test(cell.subject.name)) ||
                cell.classes?.some((c) => /חווה|חקלא/i.test(c.name || "")) ||
                (prevCell?.subject?.name && /חווה|חקלא/i.test(prevCell.subject.name)) ||
                prevCell?.classes?.some((c) => /חווה|חקלא/i.test(c.name || ""));
            const isDoublePeriodOrFarmWithPrev = !!(isPrevTaught && (isSameClassAsPrev || isAgricultureFarm));

            const candidate = findBestCandidate({
                ctx, hour: h, columnId: colId,
                originalTeacherName, originalTeacherId,
                classIds, isFullDayAbsence, isDoublePeriodOrFarmWithPrev,
            });

            const classNamesStr = (cell.classes || []).map((c) => c.name).filter(Boolean).join(", ");
            const subjectName = cell.subject?.name;

            if (h >= 6) {
                // Late hour: only assign if lower grades OR double-period continuation
                if (gradeLevel <= 3 || isDoublePeriodOrFarmWithPrev) {
                    if (candidate) {
                        cell.subTeacher = candidate.teacher;
                        cell.event = undefined;
                        assignedCount++;
                        dailySubLoad.set(candidate.teacher.id, (dailySubLoad.get(candidate.teacher.id) || 0) + 1);
                        assignments.push({ hour: h, columnTeacherName: originalTeacherName, subTeacherName: candidate.teacher.name, className: classNamesStr, subjectName, reason: candidate.reason || "שיבוץ אופטימלי", columnPosition: colPosition });
                    } else if (isDoublePeriodOrFarmWithPrev) {
                        // Cannot dismiss the second half of a double period alone — leave for manual review
                        unassignedCount++;
                        assignments.push({ hour: h, columnTeacherName: originalTeacherName, subTeacherName: "לא נמצא שיבוץ מתאים", className: classNamesStr, subjectName, reason: "לא נמצא שיבוץ מתאים", isUnassigned: true, columnPosition: colPosition });
                    } else {
                        if (!cell.event) {
                            cell.event = "משוחררים";
                            assignedCount++;
                            assignments.push({ hour: h, columnTeacherName: originalTeacherName, subTeacherName: "משוחררים", className: classNamesStr, subjectName, reason: "שחרור כיתה (סוף יום)", isReleased: true, columnPosition: colPosition });
                        }
                    }
                } else {
                    // Upper grade (4+) standalone late hour: dismiss unless a co-teacher can step in
                    if (candidate?.isCoTeacher) {
                        cell.subTeacher = candidate.teacher;
                        cell.event = undefined;
                        assignedCount++;
                        dailySubLoad.set(candidate.teacher.id, (dailySubLoad.get(candidate.teacher.id) || 0) + 1);
                        assignments.push({ hour: h, columnTeacherName: originalTeacherName, subTeacherName: candidate.teacher.name, className: classNamesStr, subjectName, reason: candidate.reason || "מורה נוסף/ת באותו שיעור", columnPosition: colPosition });
                    } else {
                        if (!cell.event) {
                            cell.event = "משוחררים";
                            assignedCount++;
                            assignments.push({ hour: h, columnTeacherName: originalTeacherName, subTeacherName: "משוחררים", className: classNamesStr, subjectName, reason: "שחרור כיתה (סוף יום)", isReleased: true, columnPosition: colPosition });
                        }
                    }
                }
            } else {
                if (candidate) {
                    cell.subTeacher = candidate.teacher;
                    cell.event = undefined;
                    assignedCount++;
                    dailySubLoad.set(candidate.teacher.id, (dailySubLoad.get(candidate.teacher.id) || 0) + 1);
                    assignments.push({ hour: h, columnTeacherName: originalTeacherName, subTeacherName: candidate.teacher.name, className: classNamesStr, subjectName, reason: candidate.reason || "שיבוץ אופטימלי", columnPosition: colPosition });
                } else {
                    unassignedCount++;
                    assignments.push({ hour: h, columnTeacherName: originalTeacherName, subTeacherName: "לא נמצא שיבוץ מתאים", className: classNamesStr, subjectName, reason: "לא נמצא שיבוץ מתאים", isUnassigned: true, columnPosition: colPosition });
                }
            }
        }
    });

    assignments.sort((a, b) => (a.columnPosition ?? 0) - (b.columnPosition ?? 0) || a.hour - b.hour);

    return {
        updatedSchedule: { ...dailySchedule, [selectedDate]: clonedDay },
        assignedCount,
        unassignedCount,
        assignments,
    };
}

// ─── Candidate search ──────────────────────────────────────────────────────────

interface CandidateSearchParams {
    ctx: AutoAssignContext;
    hour: number;
    columnId: string;
    originalTeacherName: string;
    originalTeacherId?: string;
    classIds: string[];
    isFullDayAbsence: boolean;
    isDoublePeriodOrFarmWithPrev: boolean;
}

function findBestCandidate(params: CandidateSearchParams): AutoSubstitutionCandidate | null {
    const { ctx, hour, columnId, originalTeacherName, originalTeacherId, classIds, isFullDayAbsence, isDoublePeriodOrFarmWithPrev } = params;
    const {
        dayNumber, dayNumStr, clonedDay, eligibleCandidateTeachers,
        existingPresentTeacherIds, teachesOnThisDay, mapAvailableTeachers, teacherClassMap,
        activityClassIds, activityClassNames, systemRecommendations, dailySubLoad,
        teacherStartEndMap, annualTeacherIds, managementStaffIds, counselingStaffIds,
        homeroomTeacherByClass, classNameMap,
    } = ctx;

    const hourStr = String(hour);
    const classIdsSet = new Set(classIds);

    // Teachers with a scheduled annual lesson this hour
    const scheduledTeacherIds = new Set([
        ...(mapAvailableTeachers[dayNumber]?.[hourStr] || []),
        ...(mapAvailableTeachers[dayNumStr]?.[hourStr] || []),
    ]);

    // Teachers blocked this hour: already a sub somewhere, or teaching a frontal class in blue column
    const occupiedThisHour = new Set<string>();
    Object.values(clonedDay).forEach((col) => {
        const cell = col[hourStr];
        if (cell?.subTeacher?.id) occupiedThisHour.add(cell.subTeacher.id);
        const hdr = getColumnHeader(col);
        if (hdr?.type === ColumnTypeValues.existingTeacher && hdr.headerTeacher?.id) {
            const isAct = isActivityCell(cell, activityClassIds, activityClassNames);
            const isCoveredBySub = !!cell?.subTeacher?.id;
            const isProtected =
                isProtectedActivity((cell?.classes || []).map((c) => c.name || "").join(" ")) ||
                isProtectedActivity(cell?.subject?.name);
            if (cell?.event || isProtected || (!isAct && !isCoveredBySub && cell?.classes?.length)) {
                occupiedThisHour.add(hdr.headerTeacher.id);
            }
        }
    });

    const prevSubId = clonedDay[columnId]?.[String(hour - 1)]?.subTeacher?.id;
    const nextSubId = clonedDay[columnId]?.[String(hour + 1)]?.subTeacher?.id;

    // Build historical recommendation map for this hour/teacher
    const recMap = new Map<string, number>();
    const recList: Array<{ name?: string; count?: number } | string> =
        systemRecommendations?.[hourStr]?.[originalTeacherName] || [];
    recList.forEach((item) => {
        if (typeof item === "string") recMap.set(item.trim(), 1);
        else if (item?.name) recMap.set(item.name.trim(), item.count || 1);
    });

    const isOriginalTeacherTheHomeroom = originalTeacherId
        ? Array.from(classIdsSet).some((cId) => homeroomTeacherByClass.get(cId) === originalTeacherId)
        : false;

    const candidates: AutoSubstitutionCandidate[] = [];

    for (const teacher of eligibleCandidateTeachers) {
        if (originalTeacherId && teacher.id === originalTeacherId) continue;
        if (occupiedThisHour.has(teacher.id)) continue;

        const teacherName = teacher.name?.trim() || "";
        const teachesToday = teachesOnThisDay.has(teacher.id);
        const bounds = teacherStartEndMap.get(teacher.id);
        const isPresentInBlueColumn = existingPresentTeacherIds.has(teacher.id);
        const isScheduledThisHour = scheduledTeacherIds.has(teacher.id);

        // ── HARD EXCLUSIONS ────────────────────────────────────────────────────
        if (teacher.role === TeacherRoleValues.REGULAR) {
            if (!isPresentInBlueColumn) {
                // Free day: has annual schedule but none today
                if (!teachesToday && annualTeacherIds.has(teacher.id)) continue;
                // No annual schedule: only allow if historically recommended
                if (!annualTeacherIds.has(teacher.id) && !recMap.has(teacherName)) continue;
                // Before start / after end of workday
                if (teachesToday && bounds && hour < bounds.min) continue;
                if (teachesToday && bounds && hour > bounds.max) continue;
            }
            // Universal bounds — even blue-column teachers shouldn't be extended beyond their day
            if (bounds && teachesToday && hour > bounds.max) continue;
            if (bounds && teachesToday && hour < bounds.min) continue;
        }

        const teachingClassId = teacherClassMap[dayNumStr]?.[hourStr]?.[teacher.id];
        const isCoTeacherInLesson = !!(teachingClassId && classIdsSet.has(teachingClassId));
        const isContinuingDoublePeriod = isDoublePeriodOrFarmWithPrev && prevSubId !== undefined && prevSubId === teacher.id;
        const currentSubLoad = dailySubLoad.get(teacher.id) || 0;
        const isRegularWithSchedule = teacher.role === TeacherRoleValues.REGULAR && annualTeacherIds.has(teacher.id);

        // Daily substitution limit for regular teachers (exempted for co-teacher and double-period continuation)
        if (isRegularWithSchedule && currentSubLoad >= MAX_DAILY_SUB_HOURS && !isCoTeacherInLesson && !isContinuingDoublePeriod) continue;

        // Never pull a teacher out of a frontal lesson (co-teacher exception already handled)
        let teachingActivityGroup = false;
        if (isScheduledThisHour && !isCoTeacherInLesson) {
            const isActivity = teachingClassId ? activityClassIds.has(teachingClassId) : false;
            if (!isActivity) continue; // Hard block: frontal lesson
            const className = teachingClassId ? classNameMap.get(teachingClassId) || "" : "";
            if (isProtectedActivity(className)) continue; // Hard block: management/counseling activity
            teachingActivityGroup = true;
        }
        // ── END HARD EXCLUSIONS ────────────────────────────────────────────────

        // ── TIER ASSIGNMENT ────────────────────────────────────────────────────
        let tier: number;

        if (isContinuingDoublePeriod || isCoTeacherInLesson) {
            tier = TIER_CONTINUATION;
        } else if (teachingActivityGroup) {
            tier = TIER_ACTIVITY_GROUP;
        } else if (teacher.role === TeacherRoleValues.SUBSTITUTE) {
            const isOnCampus =
                isPresentInBlueColumn ||
                (teachesToday && bounds && hour >= bounds.min && hour <= bounds.max);
            if (isOnCampus) {
                tier = TIER_SUB_ON_CAMPUS;
            } else if (isFullDayAbsence) {
                tier = TIER_SUB_CALL_IN;
            } else {
                continue; // Sub from home, not a full-day absence — skip
            }
        } else {
            // Regular teacher: on campus (passed all hard exclusions), free this hour
            tier = TIER_FREE_WINDOW;
        }

        // Management / counseling are always last resort (unless they are the co-teacher)
        if (tier !== TIER_CONTINUATION && (managementStaffIds.has(teacher.id) || counselingStaffIds.has(teacher.id))) {
            tier = TIER_PROTECTED_STAFF;
        }
        // ── END TIER ASSIGNMENT ────────────────────────────────────────────────

        // ── TIE-BREAKER SCORE (within same tier) ──────────────────────────────
        let tieBreaker = 0;

        // +3: Teacher is familiar with the target class (teaches it somewhere in the week)
        let teachesTargetClass = false;
        if (teacherClassMap[dayNumStr]) {
            Object.values(teacherClassMap[dayNumStr]).forEach((hourMap) => {
                if (hourMap[teacher.id] && classIdsSet.has(hourMap[teacher.id])) teachesTargetClass = true;
            });
        }
        if (teachesTargetClass) tieBreaker += 3;

        // +2 / +1: Historical substitution recommendation for this slot
        const histCount = recMap.get(teacherName);
        if (histCount !== undefined) tieBreaker += histCount >= 4 ? 2 : 1;

        // +1: Same teacher is already subbing in adjacent hour of the same column
        if ((prevSubId && teacher.id === prevSubId) || (nextSubId && teacher.id === nextSubId)) {
            tieBreaker += 1;
        }

        // −1 per sub hour already assigned today
        tieBreaker -= currentSubLoad;

        // −3: Homeroom teacher of target class — protect from burnout in their own class window
        const isHomeroomOfTargetClass = Array.from(classIdsSet).some(
            (cId) => homeroomTeacherByClass.get(cId) === teacher.id
        );
        if (isHomeroomOfTargetClass && !isOriginalTeacherTheHomeroom) tieBreaker -= 3;
        // ── END TIE-BREAKER ────────────────────────────────────────────────────

        // Encode score: lower tier wins; within tier, higher tieBreaker wins
        const score = (5 - tier) * 100 + tieBreaker;

        // ── REASON TEXT ────────────────────────────────────────────────────────
        let baseReason: string;
        if (isCoTeacherInLesson) {
            baseReason = "מורה נוסף/ת באותו שיעור";
        } else if (teachingActivityGroup) {
            baseReason = teachesTargetClass
                ? "מורה בקבוצת עבודה/לימוד ומכיר/ה את הכיתה"
                : "מורה בקבוצת עבודה/לימוד";
        } else if (teacher.role === TeacherRoleValues.SUBSTITUTE) {
            const isOnCampus =
                isPresentInBlueColumn ||
                (teachesToday && bounds && hour >= bounds.min && hour <= bounds.max);
            baseReason = isOnCampus ? 'מורה מחליפ/ה נוכח/ת בביה"ס' : "מורה מחליפ/ה (קריאה)";
        } else if (managementStaffIds.has(teacher.id) || counselingStaffIds.has(teacher.id)) {
            baseReason = "צוות ניהול / ייעוץ";
        } else if (!isScheduledThisHour) {
            baseReason = teachesTargetClass
                ? "מכיר/ה את הכיתה — חלון פנוי במערכת"
                : "חלון פנוי במערכת";
        } else {
            baseReason = teachesTargetClass
                ? "מכיר/ה את הכיתה וזמינות במערכת"
                : "זמינות במערכת והתאמה גבוהה";
        }

        let reason: string;
        if (isContinuingDoublePeriod) {
            if (baseReason && baseReason !== "זמינות במערכת והתאמה גבוהה") {
                reason = `${baseReason}, המשכיות שיעור`;
            } else {
                reason = "המשכיות שיעור";
            }
        } else {
            reason = baseReason;
        }
        // ── END REASON ─────────────────────────────────────────────────────────

        candidates.push({ teacher, score, isCoTeacher: isCoTeacherInLesson, reason });
    }

    if (candidates.length === 0) return null;

    candidates.sort((a, b) => b.score - a.score);
    return candidates[0];
}
