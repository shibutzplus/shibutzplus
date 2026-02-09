import { GroupOption } from "@/models/types";
import { AvailableTeachers } from "@/models/types/annualSchedule";
import { ColumnTypeValues, DailySchedule, DailyScheduleCell, } from "@/models/types/dailySchedule";
import { TeacherRoleValues, TeacherType } from "@/models/types/teachers";
import { dayToNumber } from "./time";
import { createSelectOptions } from "./format";

// DailySchedule Header Dropdown: Filter header teacher options: only regular teachers, avoid duplicates
export const filterDailyHeaderTeachers = (
    teachers: TeacherType[] | undefined,
    alreadySelectedTeachers: DailySchedule,
    selectedTeacher?: TeacherType,
    teachersTeachingTodayIds?: Set<string>,
    selectedDate?: string,
) => {
    const flatTeachersSet = new Set<string>();

    if (!teachers || teachers.length === 0) {
        if (selectedTeacher) {
            return createSelectOptions([selectedTeacher]);
        }
        return [];
    }

    // Collect all teachers already selected as header in any daily column for the CURRENT DATE
    if (selectedDate && alreadySelectedTeachers[selectedDate]) {
        Object.values(alreadySelectedTeachers[selectedDate]).forEach((dailyCol) => {
            // Check the header cell (hour "1")
            const headerTeacher = dailyCol["1"]?.headerCol?.headerTeacher;
            if (headerTeacher?.id) {
                flatTeachersSet.add(headerTeacher.id);
            }
        });
    } else if (!selectedDate) {
        // Fallback or legacy behavior (if needed, though we should always have selectedDate)
        Object.values(alreadySelectedTeachers).forEach((day) => {
            Object.values(day).forEach((dailyCol) => {
                // Determine if 'dailyCol' is Column or HourMap...
                // Based on types: DailySchedule[day] is Record<columnId, Record<hour, Cell>>
                // So dailyCol here is Record<hour, Cell> which represents one column
                const headerTeacher = dailyCol["1"]?.headerCol?.headerTeacher;
                if (headerTeacher?.id) {
                    flatTeachersSet.add(headerTeacher.id);
                }
            });
        });
    }

    const filteredTeachers = teachers.filter((teacher) => {
        const isRegular = teacher.role === TeacherRoleValues.REGULAR;
        const isCurrentOrNotUsed =
            teacher.id === selectedTeacher?.id || !flatTeachersSet.has(teacher.id);

        // If teachersTeachingTodayIds is provided, keep only teachers that teach today, but ALWAYS keep the currently selected teacher
        const teachesToday =
            !teachersTeachingTodayIds ||
            teachersTeachingTodayIds.has(teacher.id) ||
            teacher.id === selectedTeacher?.id;

        return isRegular && isCurrentOrNotUsed && teachesToday;
    });

    return createSelectOptions(filteredTeachers);
};

// DailySchedule Dropdown: Build grouped teacher options (substitutes, available, unavailable) for a specific day/hour
export const sortDailyTeachers = (
    allTeachers: TeacherType[],
    mapAvailableTeachers: AvailableTeachers,
    dailyDay: {
        [header: string]: {
            [hour: string]: DailyScheduleCell;
        };
    },
    day: string,
    hour: number,
    teacherAtIndex: Record<string, Record<string, Record<string, string>>> = {},
    classNameById: Record<string, string> = {},
    currentHeaderTeacherId?: string,
    classActivityById: Record<string, boolean> = {},
    recommendedTeacherIds: string[] = [],
    currentColumnId?: string,
) => {
    const dayNum = dayToNumber(day);
    const dayKey = String(dayNum);
    const hourStr = hour.toString();

    // Frequent replacements logic
    const frequentReplacementIds = new Set<string>();
    if (currentColumnId && dailyDay && dailyDay[currentColumnId]) {
        const columnCells = Object.values(dailyDay[currentColumnId]);
        const replacementCounts = new Map<string, number>();

        columnCells.forEach(cell => {
            if (cell.subTeacher?.id) {
                const id = cell.subTeacher.id;
                replacementCounts.set(id, (replacementCounts.get(id) || 0) + 1);
            }
        });

        replacementCounts.forEach((count, id) => {
            if (count > 1) {
                frequentReplacementIds.add(id);
            }
        });
    }

    // Annual availability lookups
    const scheduledTeacherIds = new Set(mapAvailableTeachers[dayNum]?.[hourStr] || []);
    const teachesOnDayIds = new Set<string>();
    const teacherStartEndMap = new Map<string, { min: number; max: number }>();

    if (mapAvailableTeachers[dayNum]) {
        Object.entries(mapAvailableTeachers[dayNum]).forEach(([hStr, hourTeachers]) => {
            const h = parseInt(hStr);
            hourTeachers.forEach((id) => {
                teachesOnDayIds.add(id);
                const current = teacherStartEndMap.get(id) || { min: 24, max: -1 };
                teacherStartEndMap.set(id, {
                    min: Math.min(current.min, h),
                    max: Math.max(current.max, h),
                });
            });
        });
    }

    // Build a set of all teachers appearing anywhere in the annual schedule
    const annualTeacherIds = new Set<string>();
    Object.values(mapAvailableTeachers || {}).forEach((hoursMap) => {
        Object.values(hoursMap || {}).forEach((ids) => {
            ids.forEach((id) => annualTeacherIds.add(id));
        });
    });

    // Track teachers already assigned in other daily columns for this hour
    const dailyAssignedTeacherIds = new Set<string>();
    const subTeachersThisHour = new Set<string>(); // teachers assigned as a sub
    const missingTeacherIds = new Set<string>();

    if (dailyDay) {
        Object.values(dailyDay).forEach((dailyColumn) => {
            const headerCell = dailyColumn["1"];
            if (
                headerCell?.headerCol?.type === ColumnTypeValues.missingTeacher &&
                headerCell.headerCol.headerTeacher?.id
            ) {
                missingTeacherIds.add(headerCell.headerCol.headerTeacher.id);
            }

            const column = dailyColumn[hourStr];
            if (!column) return;

            // Sub teacher occupying this hour in another column
            if (column.subTeacher?.id) {
                dailyAssignedTeacherIds.add(column.subTeacher.id);
                subTeachersThisHour.add(column.subTeacher.id); // mark as current substitute
            }
        });
    }

    const substituteTeachers: TeacherType[] = []; // substitute teachers
    const availableTeachers: TeacherType[] = []; // regular teachers free this hour
    const unavailableTeachers: TeacherType[] = []; // teachers busy this hour
    const freeDayTeachers: TeacherType[] = []; // regular teachers not teaching on this day
    const notStartedTeachers: TeacherType[] = []; // teachers not started yet
    const finishedTeachers: TeacherType[] = []; // teachers already finished
    const recommendedTeachers: { teacher: TeacherType; suffix: string }[] = []; // system recommended teachers (new)

    // Helper map for sort order of recommendations
    const recommendationOrder = new Map<string, number>();
    recommendedTeacherIds.forEach((id, index) => recommendationOrder.set(id, index));

    for (const teacher of allTeachers) {
        if (missingTeacherIds.has(teacher.id)) continue;
        // Staff members should not be selectable for substitution
        if (teacher.role === TeacherRoleValues.STAFF) continue;

        // skip the column's header teacher as it should not appear in its own dropdown
        if (currentHeaderTeacherId && teacher.id === currentHeaderTeacherId) continue;

        // Block teachers already placed in another daily column at this hour
        if (dailyAssignedTeacherIds.has(teacher.id)) {
            unavailableTeachers.push(teacher);
            continue;
        }

        // Check if recommended
        if (recommendationOrder.has(teacher.id) || frequentReplacementIds.has(teacher.id)) {
            let suffix = "";

            if (teacher.role === TeacherRoleValues.SUBSTITUTE) {
                suffix = "מילוי מקום";
            } else if (scheduledTeacherIds.has(teacher.id)) {
                // Check class name
                const classId = teacherAtIndex?.[dayKey]?.[hourStr]?.[teacher.id];
                const className = classId ? classNameById[classId] || classId : "שיעור אחר";
                suffix = className;
            } else if (teacher.role === TeacherRoleValues.REGULAR) {
                const teachesToday = teachesOnDayIds.has(teacher.id);
                if (teachesToday) {
                    const bounds = teacherStartEndMap.get(teacher.id);
                    if (bounds) {
                        if (hour < bounds.min || hour > bounds.max) suffix = "לא נוכח";
                        else suffix = "פנוי";
                    } else {
                        suffix = "פנוי";
                    }
                } else {
                    if (annualTeacherIds.has(teacher.id)) suffix = "יום חופשי";
                    else suffix = "ללא מערכת";
                }
            }

            recommendedTeachers.push({ teacher, suffix });
        }

        if (teacher.role === TeacherRoleValues.SUBSTITUTE) {
            substituteTeachers.push(teacher);
        } else if (teacher.role === TeacherRoleValues.REGULAR) {
            const teachesToday = teachesOnDayIds.has(teacher.id);
            const scheduledThisHour = scheduledTeacherIds.has(teacher.id);

            if (teachesToday) {
                if (!scheduledThisHour) {
                    const bounds = teacherStartEndMap.get(teacher.id);
                    if (bounds) {
                        if (hour < bounds.min) {
                            notStartedTeachers.push(teacher);
                        } else if (hour > bounds.max) {
                            finishedTeachers.push(teacher);
                        } else {
                            availableTeachers.push(teacher);
                        }
                    } else {
                        availableTeachers.push(teacher);
                    }
                } else {
                    unavailableTeachers.push(teacher);
                }
            } else {
                // Regular teacher with a free day, but only if they appear in the annual schedule at least once
                if (annualTeacherIds.has(teacher.id)) {
                    freeDayTeachers.push(teacher);
                }
            }
        }
    }

    // Sort recommended teachers by the order they came in (count desc)
    recommendedTeachers.sort((a, b) => {
        const orderA = recommendationOrder.get(a.teacher.id) ?? Infinity;
        const orderB = recommendationOrder.get(b.teacher.id) ?? Infinity;
        return orderA - orderB;
    });

    // Regular teachers with zero annual hours
    const extraRegularTeachers = allTeachers.filter(
        (t) => t.role === TeacherRoleValues.REGULAR && !annualTeacherIds.has(t.id),
    );

    // Label helper: add class name for annual-unavailable
    const getUnavailableLabel = (t: TeacherType) => {
        const classId = teacherAtIndex?.[dayKey]?.[hourStr]?.[t.id];
        const className = classId ? classNameById[classId] || classId : undefined;
        return className ? `${t.name} (${className})` : t.name;
    };

    // Additional teachers for the same lesson (co-teachers of the header's class at this time)
    const additionalLessonTeachers: TeacherType[] = (() => {
        if (!currentHeaderTeacherId) return [];
        const indexForSlot = teacherAtIndex?.[dayKey]?.[hourStr] || {};
        const headerClassId = indexForSlot[currentHeaderTeacherId];
        if (!headerClassId) return [];

        const ids = Object.entries(indexForSlot)
            .filter(([tid, cid]) => cid === headerClassId && tid !== currentHeaderTeacherId)
            .map(([tid]) => tid)
            .filter((tid) => !subTeachersThisHour.has(tid) && !dailyAssignedTeacherIds.has(tid));

        if (ids.length === 0) return [];

        const byId = new Map(allTeachers.map((t) => [t.id, t]));
        const unique: TeacherType[] = [];
        const seen = new Set<string>();
        for (const id of ids) {
            if (seen.has(id)) continue;
            const t = byId.get(id);
            if (t) {
                unique.push(t);
                seen.add(id);
            }
        }
        return unique;
    })();

    const isTeacherInActivityClass = (teacherId: string) => {
        const classId = teacherAtIndex?.[dayKey]?.[hourStr]?.[teacherId];
        if (!classId) return false;
        return !!classActivityById[classId];
    };

    // Exclude "מורים נוספים בתקן" from the Unavailable list
    const additionalIds = new Set(additionalLessonTeachers.map((t) => t.id));
    const filteredUnavailableTeachers = unavailableTeachers.filter((t) => !additionalIds.has(t.id));

    const activityTeachers = filteredUnavailableTeachers
        .filter((t) => !subTeachersThisHour.has(t.id) && isTeacherInActivityClass(t.id))
        .sort((a, b) => {
            const classIdA = teacherAtIndex?.[dayKey]?.[hourStr]?.[a.id];
            const classNameA = classIdA ? classNameById[classIdA] || classIdA : "";

            const classIdB = teacherAtIndex?.[dayKey]?.[hourStr]?.[b.id];
            const classNameB = classIdB ? classNameById[classIdB] || classIdB : "";

            const groupCompare = classNameA.localeCompare(classNameB, "he", { numeric: true });
            if (groupCompare !== 0) return groupCompare;

            return a.name.localeCompare(b.name, "he", { numeric: true });
        });

    const nonActivityClassTeachers = filteredUnavailableTeachers
        .filter((t) => !subTeachersThisHour.has(t.id) && !isTeacherInActivityClass(t.id))
        .sort((a, b) => {
            const classIdA = teacherAtIndex?.[dayKey]?.[hourStr]?.[a.id];
            const classNameA = classIdA ? classNameById[classIdA] || classIdA : "";

            const classIdB = teacherAtIndex?.[dayKey]?.[hourStr]?.[b.id];
            const classNameB = classIdB ? classNameById[classIdB] || classIdB : "";

            return classNameA.localeCompare(classNameB, "he", { numeric: true });
        });

    // Groups
    const groups: GroupOption[] = [
        ...(recommendedTeachers.length > 0 ? [{
            label: "המלצת המערכת",
            collapsed: true,
            options: recommendedTeachers.map((t) => ({
                value: t.teacher.id,
                label: t.suffix ? `${t.teacher.name} (${t.suffix})` : t.teacher.name,
            })),
        }] : []),

        {
            label: "מורה נוסף בשיעור",
            collapsed: true,
            options: additionalLessonTeachers.map((t) => ({ value: t.id, label: t.name })),
        },
        {
            label: "מורים מילוי מקום",
            collapsed: true,
            options: substituteTeachers.map((teacher) => ({
                value: teacher.id,
                label: teacher.name,
            })),
        },
        {
            label: "מורים ללא מערכת",
            collapsed: true,
            options: extraRegularTeachers.map((t) => ({ value: t.id, label: t.name })),
        },
        {
            label: "מורים פנויים",
            collapsed: true,
            options: availableTeachers.map((teacher) => ({
                value: teacher.id,
                label: teacher.name,
            })),
        },
        {
            label: "מורים בקבוצת עבודה",
            collapsed: true,
            options: activityTeachers.map((teacher) => ({
                value: teacher.id,
                label: getUnavailableLabel(teacher),
            })),
        },
        {
            label: "מלמדים בכיתה אחרת",
            collapsed: true,
            options: nonActivityClassTeachers.map((teacher) => ({
                value: teacher.id,
                label: getUnavailableLabel(teacher),
            })),
        },
        {
            label: "לא התחילו את היום",
            collapsed: true,
            options: notStartedTeachers.map((t) => ({ value: t.id, label: t.name })),
        },
        {
            label: "סיימו את יום העבודה",
            collapsed: true,
            options: finishedTeachers.map((t) => ({ value: t.id, label: t.name })),
        },
        {
            label: "ביום חופשי",
            collapsed: true,
            options: freeDayTeachers.map((t) => ({ value: t.id, label: t.name })),
        },

    ];

    return groups;
};

// Sort columns by position (field 'position' in headerCol)
export const sortDailyColumnIdsByPosition = (
    columnIds: string[],
    daySchedule: Record<string, Record<string, DailyScheduleCell>> | undefined,
) => {
    if (!daySchedule) return columnIds;

    return [...columnIds].sort((a, b) => {
        const posA = Object.values(daySchedule[a] || {})[0]?.headerCol?.position ?? 0;
        const posB = Object.values(daySchedule[b] || {})[0]?.headerCol?.position ?? 0;
        return posA - posB;
    });
};

// General Hebrew sort helper
export const compareHebrew = (a: string, b: string) => {
    return a.localeCompare(b, "he", { numeric: true });
};

// Sort objects by name property
export const sortByName = <T extends { name: string }>(a: T, b: T) => {
    return compareHebrew(a.name, b.name);
};
