import { AnnualScheduleType, WeeklySchedule } from "@/models/types/annualSchedule";
import { ClassType } from "@/models/types/classes";
import { SubjectType } from "@/models/types/subjects";
import { TeacherType } from "@/models/types/teachers";
import { DAYS_OF_WEEK } from "@/utils/time";

export const getRowId = (
    annualScheduleTable: AnnualScheduleType[] | undefined,
    selectedClassId: string,
    day: string,
    hour: number,
) => {
    const id =
        annualScheduleTable?.find(
            (entry) =>
                entry.class.id === selectedClassId &&
                entry.day === Number(DAYS_OF_WEEK.indexOf(day) + 1) &&
                entry.hour === hour,
        )?.id || "";
    return id;
};

export const getSelectedElements = (
    teacherId: string,
    subjectId: string,
    type: "teacher" | "subject",
    isNew: TeacherType | SubjectType | undefined,
    subjects: SubjectType[] | undefined,
    teachers: TeacherType[] | undefined,
) => {
    // Find the elements by ID, for the selected class, teacher, and subject
    let selectedTeacher: TeacherType | undefined;
    let selectedSubject: SubjectType | undefined;
    if (isNew) {
        if (type === "teacher") {
            selectedTeacher = isNew as TeacherType;
            selectedSubject = subjects?.find((s) => s.id === subjectId);
        } else if (type === "subject") {
            selectedSubject = isNew as SubjectType;
            selectedTeacher = teachers?.find((t) => t.id === teacherId);
        }
    } else {
        selectedTeacher = teachers?.find((t) => t.id === teacherId);
        selectedSubject = subjects?.find((s) => s.id === subjectId);
    }
    return { selectedTeacher, selectedSubject };
};

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
        newSchedule[selectedClassId][day][hour] = { teacher: "", subject: "" };
    }
    return newSchedule;
};

