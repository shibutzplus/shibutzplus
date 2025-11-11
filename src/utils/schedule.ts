import { AnnualScheduleType, WeeklySchedule } from "@/models/types/annualSchedule";
import { DAYS_OF_WEEK } from "./time";

export const populateAnnualSchedule = (
    annualScheduleTable: AnnualScheduleType[] | undefined,
    selectedClassId: string,
    newSchedule: WeeklySchedule,
) => {
    // If annualScheduleTable has data for this class, populate the schedule
    if (annualScheduleTable && annualScheduleTable.length > 0) {
        let classEntries = annualScheduleTable.filter(
            (entry) => entry.class?.id === selectedClassId,
        );

        classEntries.forEach((entry) => {
            // Convert day number (1-7) to day name (0-based index)
            const dayName = DAYS_OF_WEEK[entry.day - 1];

            if (dayName && newSchedule[selectedClassId][dayName]) {
                if (!newSchedule[selectedClassId][dayName][entry.hour]) {
                    newSchedule[selectedClassId][dayName][entry.hour] = {
                        teachers: [],
                        subjects: [],
                        classId: entry.class?.id,
                    };
                } else if (!newSchedule[selectedClassId][dayName][entry.hour].classId) {
                    newSchedule[selectedClassId][dayName][entry.hour].classId = entry.class?.id;
                }

                const cell = newSchedule[selectedClassId][dayName][entry.hour];
                if (entry.teacher?.id && !cell.teachers.includes(entry.teacher.id))
                    cell.teachers.push(entry.teacher.id);
                if (entry.subject?.id && !cell.subjects.includes(entry.subject.id))
                    cell.subjects.push(entry.subject.id);
            }
        });
    }
    return newSchedule;
};
