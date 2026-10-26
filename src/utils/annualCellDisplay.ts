import { AnnualScheduleCell } from "@/models/types/annualSchedule";
import { ClassType } from "@/models/types/classes";
import { SubjectType } from "@/models/types/subjects";
import { TeacherType } from "@/models/types/teachers";

export type AssignmentGroup = {
    primaryText?: string;
    subjectText?: string;
};

export interface AnnualCellDisplayData {
    assignmentGroups: AssignmentGroup[];
    shouldRender: boolean;
}

export const getAnnualCellDisplayData = (
    cellData: AnnualScheduleCell | undefined,
    selectedClassId: string,
    selectedTeacherId: string,
    subjects: SubjectType[],
    teachers: TeacherType[],
    classes: ClassType[]
): AnnualCellDisplayData => {
    if (!cellData) {
        return {
            assignmentGroups: [],
            shouldRender: false,
        };
    }

    const { teachers: teacherIds, subjects: subjectIds, classes: classesIds } = cellData;

    // Helper lookups
    const getSubjectName = (id: string) => subjects.find((s) => s.id === id)?.name || "";
    const getTeacherName = (id: string) => teachers.find((t) => t.id === id)?.name || "";
    const getClassName = (id: string) => classes.find((c) => c.id === id)?.name || "";
    const isActivityClass = (id: string) => classes.find((c) => c.id === id)?.activity;

    const isClassView = !!selectedClassId;
    const isTeacherView = !!selectedTeacherId;
    const isBothSelected = isClassView && isTeacherView;

    // 1. Filtering Logic
    if (isBothSelected) {
        // If both selected, verify the teacher is actually in this cell
        const isTeacherInCell = teacherIds.includes(selectedTeacherId);
        if (!isTeacherInCell) {
            return {
                assignmentGroups: [],
                shouldRender: false,
            };
        }
    }

    // 2. Content Generation

    // Subjects
    // In Class View (or Both), hide subjects if the selected class is an activity
    let showSubjects = true;
    if (isClassView && isActivityClass(selectedClassId)) {
        showSubjects = false;
    }

    // 3. Assignment Groups (Paired teacher-subject or class-subject)
    const assignmentGroups: AssignmentGroup[] = [];

    if (isBothSelected) {
        let matchedSubjectId: string | undefined;
        if (cellData.teacherSubjects && cellData.teacherSubjects.length > 0) {
            const matched = cellData.teacherSubjects.find((ts) => ts.teacherId === selectedTeacherId);
            if (matched) matchedSubjectId = matched.subjectId;
        }
        if (!matchedSubjectId && subjectIds && subjectIds.length > 0) {
            matchedSubjectId = subjectIds[0];
        }

        const sName = matchedSubjectId && showSubjects ? getSubjectName(matchedSubjectId) : undefined;
        assignmentGroups.push({
            primaryText: undefined,
            subjectText: sName,
        });
    } else if (isClassView) {
        if (cellData.teacherSubjects && cellData.teacherSubjects.length > 0) {
            // Group teachers by subjectId
            const subjectTeachersMap = new Map<string, string[]>();
            cellData.teacherSubjects.forEach((ts) => {
                const list = subjectTeachersMap.get(ts.subjectId) || [];
                if (!list.includes(ts.teacherId)) {
                    list.push(ts.teacherId);
                }
                subjectTeachersMap.set(ts.subjectId, list);
            });

            subjectTeachersMap.forEach((tIds, sId) => {
                const sName = showSubjects ? getSubjectName(sId) : undefined;
                assignmentGroups.push({
                    primaryText: tIds.map(getTeacherName).filter(Boolean).join(", "),
                    subjectText: sName,
                });
            });

            // Catch any teachers not in teacherSubjects
            const assignedTeachers = new Set(cellData.teacherSubjects.map((ts) => ts.teacherId));
            const unassignedTeachers = (teacherIds || []).filter((id) => !assignedTeachers.has(id));
            if (unassignedTeachers.length > 0) {
                assignmentGroups.push({
                    primaryText: unassignedTeachers.map(getTeacherName).filter(Boolean).join(", "),
                    subjectText: undefined,
                });
            }

            // Catch any subjects not in teacherSubjects
            const assignedSubjects = new Set(cellData.teacherSubjects.map((ts) => ts.subjectId));
            const unassignedSubjects = (subjectIds || []).filter((id) => !assignedSubjects.has(id));
            unassignedSubjects.forEach((sId) => {
                const sName = showSubjects ? getSubjectName(sId) : undefined;
                if (sName) {
                    assignmentGroups.push({
                        primaryText: undefined,
                        subjectText: sName,
                    });
                }
            });
        } else {
            // Fallback when teacherSubjects is not populated
            if (subjectIds && subjectIds.length === 1) {
                const sName = showSubjects ? getSubjectName(subjectIds[0]) : undefined;
                assignmentGroups.push({
                    primaryText: (teacherIds || []).map(getTeacherName).filter(Boolean).join(", "),
                    subjectText: sName,
                });
            } else if (teacherIds && teacherIds.length > 0 && subjectIds && subjectIds.length > 0) {
                const count = Math.max(teacherIds.length, subjectIds.length);
                for (let i = 0; i < count; i++) {
                    const tId = teacherIds[i];
                    const sId = subjectIds[i];
                    const sName = sId && showSubjects ? getSubjectName(sId) : undefined;
                    assignmentGroups.push({
                        primaryText: tId ? getTeacherName(tId) : undefined,
                        subjectText: sName,
                    });
                }
            } else if (teacherIds && teacherIds.length > 0) {
                assignmentGroups.push({
                    primaryText: teacherIds.map(getTeacherName).filter(Boolean).join(", "),
                    subjectText: undefined,
                });
            } else if (subjectIds && subjectIds.length > 0) {
                subjectIds.forEach((sId) => {
                    const sName = showSubjects ? getSubjectName(sId) : undefined;
                    if (sName) {
                        assignmentGroups.push({
                            primaryText: undefined,
                            subjectText: sName,
                        });
                    }
                });
            }
        }
    } else {
        // Teacher View (or unselected/all)
        if (cellData.classSubjects && cellData.classSubjects.length > 0) {
            cellData.classSubjects.forEach((cs) => {
                const isAct = isActivityClass(cs.classId);
                const sName = showSubjects && !isAct ? getSubjectName(cs.subjectId) : undefined;
                assignmentGroups.push({
                    primaryText: getClassName(cs.classId),
                    subjectText: sName,
                });
            });

            const assignedClasses = new Set(cellData.classSubjects.map((cs) => cs.classId));
            const unassignedClasses = (classesIds || []).filter((id) => !assignedClasses.has(id));
            if (unassignedClasses.length > 0) {
                unassignedClasses.forEach((cId) => {
                    assignmentGroups.push({
                        primaryText: getClassName(cId),
                        subjectText: undefined,
                    });
                });
            }
        } else {
            // Fallback when classSubjects is not populated
            if (classesIds && classesIds.length > 0) {
                if (subjectIds && subjectIds.length === 1) {
                    classesIds.forEach((cId) => {
                        const isAct = isActivityClass(cId);
                        const sName = showSubjects && !isAct ? getSubjectName(subjectIds[0]) : undefined;
                        assignmentGroups.push({
                            primaryText: getClassName(cId),
                            subjectText: sName,
                        });
                    });
                } else if (subjectIds && subjectIds.length > 1) {
                    const count = Math.max(classesIds.length, subjectIds.length);
                    for (let i = 0; i < count; i++) {
                        const cId = classesIds[i];
                        const sId = subjectIds[i];
                        const isAct = cId ? isActivityClass(cId) : false;
                        const sName = sId && showSubjects && !isAct ? getSubjectName(sId) : undefined;
                        assignmentGroups.push({
                            primaryText: cId ? getClassName(cId) : undefined,
                            subjectText: sName,
                        });
                    }
                } else {
                    classesIds.forEach((cId) => {
                        assignmentGroups.push({
                            primaryText: getClassName(cId),
                            subjectText: undefined,
                        });
                    });
                }
            } else if (subjectIds && subjectIds.length > 0) {
                subjectIds.forEach((sId) => {
                    const sName = showSubjects ? getSubjectName(sId) : undefined;
                    if (sName) {
                        assignmentGroups.push({
                            primaryText: undefined,
                            subjectText: sName,
                        });
                    }
                });
            }
        }
    }

    const filteredGroups = assignmentGroups.filter((g) => g.primaryText || g.subjectText);

    return {
        assignmentGroups: filteredGroups,
        shouldRender: true,
    };
};

export const getAnnualScheduleDimensions = (
    schedule: import("@/models/types/annualSchedule").WeeklySchedule | undefined,
    selectedClassId: string,
    selectedTeacherId: string,
    toHour: number = 10,
    fromHour: number = 1
) => {
    const lookupId = selectedClassId || selectedTeacherId;
    let maxHourWithData = 0;

    if (lookupId && schedule && schedule[lookupId]) {
        Object.values(schedule[lookupId]).forEach((dayData) => {
            Object.entries(dayData).forEach(([hourStr, cell]) => {
                const hourVal = parseInt(hourStr, 10);

                // If both selected, apply the same filter to the row count calculation
                if (selectedClassId && selectedTeacherId) {
                    if (!cell.teachers?.includes(selectedTeacherId)) {
                        return; // Skip this cell if teacher not present
                    }
                }

                if (
                    (cell.teachers && cell.teachers.length > 0) ||
                    (cell.subjects && cell.subjects.length > 0) ||
                    (cell.classes && cell.classes.length > 0)
                ) {
                    maxHourWithData = Math.max(maxHourWithData, hourVal);
                }
            });
        });
    }

    const minLastRow = Math.max(6, fromHour);
    const lastRow = Math.min(toHour, Math.max(minLastRow, maxHourWithData));
    const rowsCount = Math.max(0, lastRow - fromHour + 1);

    return { rowsCount };
};
