import { AnnualScheduleType } from "@/models/types/annualSchedule";
import { ClassType } from "@/models/types/classes";
import { SubjectType } from "@/models/types/subjects";
import { TeacherType } from "@/models/types/teachers";
import { compareHebrew } from "@/utils/sort";
import { getClassGradeLevel } from "@/utils/tutoringSchedule";
import { DAYS_OF_WEEK } from "@/utils/time";

export type TutoringReportColumn = {
    id: string;
    name: string;
};

export type TutoringReportAssignment = {
    teacherId: string;
    teacherName: string;
    day: number;
    hour: number;
    timeLabel: string;
};

export type TutoringReportRow = {
    classObj: ClassType;
    // Map of columnId -> assignments list
    cells: Record<string, TutoringReportAssignment[]>;
};

export type TutoringReportData = {
    columns: TutoringReportColumn[];
    rows: TutoringReportRow[];
};

const isTutoringName = (name?: string): boolean => {
    if (!name) return false;
    const trimmed = name.trim();
    return trimmed === "פרטני" || trimmed.includes("פרטני");
};

export const buildTutoringReportData = (
    annualScheduleTable: AnnualScheduleType[] | undefined,
    classes: ClassType[] | undefined,
    teachers: TeacherType[] | undefined,
    subjects: SubjectType[] | undefined
): TutoringReportData => {
    // 1. Filter and sort organic homeroom classes (rows)
    const organicClasses = (classes || [])
        .filter((c) => !c.activity && !isTutoringName(c.name))
        .sort((a, b) => {
            const gradeA = getClassGradeLevel(a.name);
            const gradeB = getClassGradeLevel(b.name);
            if (gradeA !== gradeB) {
                if (gradeA > 0 && gradeB > 0) return gradeA - gradeB;
                if (gradeA > 0) return -1;
                if (gradeB > 0) return 1;
            }
            return compareHebrew(a.name, b.name);
        });

    const classMap = new Map<string, ClassType>();
    organicClasses.forEach((c) => classMap.set(c.id, c));

    const teacherMap = new Map<string, TeacherType>();
    (teachers || []).forEach((t) => teacherMap.set(t.id, t));

    const subjectMap = new Map<string, SubjectType>();
    (subjects || []).forEach((s) => subjectMap.set(s.id, s));

    // 2. Collect tutoring columns (each distinct tutoring subject)
    // - Pre-populate all tutoring subjects defined in the school
    const columnsMap = new Map<string, TutoringReportColumn>();

    (subjects || []).forEach((s) => {
        if (isTutoringName(s.name)) {
            columnsMap.set(s.id, {
                id: s.id,
                name: s.name,
            });
        }
    });

    // 3. Matrix: classId -> columnId (subjectId) -> List of assignments
    const gridMap = new Map<string, Map<string, TutoringReportAssignment[]>>();
    organicClasses.forEach((c) => gridMap.set(c.id, new Map()));

    (annualScheduleTable || []).forEach((entry) => {
        const sId = entry.subjectId || entry.subject?.id;
        const cId = entry.classId || entry.class?.id;
        const tId = entry.teacherId || entry.teacher?.id;

        const subject = sId ? subjectMap.get(sId) : undefined;
        const targetClass = cId ? classMap.get(cId) : undefined;
        const teacher = tId ? teacherMap.get(tId) : undefined;

        if (!targetClass || !teacher) return;

        // Tutoring assignment: subject name or class name contains "פרטני"
        const isTutoring = isTutoringName(subject?.name) || isTutoringName(entry.class?.name);
        if (!isTutoring) return;

        // Column = the exact tutoring subject chosen (e.g. "פרטני - שפה")
        const colId = subject?.id || sId || "tutoring_generic";
        const colName = subject?.name || "פרטני";

        if (!columnsMap.has(colId)) {
            columnsMap.set(colId, {
                id: colId,
                name: colName,
            });
        }

        const dayChar = DAYS_OF_WEEK[entry.day - 1] || `${entry.day}`;
        const timeLabel = `יום ${dayChar}', שעה ${entry.hour}`;

        // Record assignment in grid for this class and subject column
        const classRow = gridMap.get(targetClass.id);
        if (classRow) {
            if (!classRow.has(colId)) {
                classRow.set(colId, []);
            }
            const existingList = classRow.get(colId)!;
            const isDuplicate = existingList.some(
                (item) => item.teacherId === teacher.id && item.day === entry.day && item.hour === entry.hour
            );
            if (!isDuplicate) {
                existingList.push({
                    teacherId: teacher.id,
                    teacherName: teacher.name,
                    day: entry.day,
                    hour: entry.hour,
                    timeLabel,
                });
            }
        }
    });

    // If no tutoring subjects exist at all, provide a single generic column
    if (columnsMap.size === 0) {
        columnsMap.set("tutoring_default", {
            id: "tutoring_default",
            name: "פרטני",
        });
    }

    // 4. Sort columns alphabetically by subject name
    const finalColumns: TutoringReportColumn[] = Array.from(columnsMap.values()).sort((a, b) =>
        compareHebrew(a.name, b.name)
    );

    // 5. Build final rows (sorted by day, then hour, then teacher name)
    const rows: TutoringReportRow[] = organicClasses.map((cls) => {
        const classRow = gridMap.get(cls.id) || new Map<string, TutoringReportAssignment[]>();
        const cells: Record<string, TutoringReportAssignment[]> = {};

        finalColumns.forEach((col) => {
            const assignments = classRow.get(col.id);
            cells[col.id] = assignments
                ? [...assignments].sort((a, b) => {
                      if (a.day !== b.day) return a.day - b.day;
                      if (a.hour !== b.hour) return a.hour - b.hour;
                      return compareHebrew(a.teacherName, b.teacherName);
                  })
                : [];
        });

        return {
            classObj: cls,
            cells,
        };
    });

    return {
        columns: finalColumns,
        rows,
    };
};
