import { AnnualScheduleType, WeeklySchedule } from "@/models/types/annualSchedule";
import { DAYS_OF_WEEK } from "./time";

export const populateAnnualSchedule = (
    annualScheduleTable: AnnualScheduleType[] | undefined,
    selectedClassId: string,
    newSchedule: WeeklySchedule,
    teacherId?: string,     // optional teacher filter
    targetKey?: string      // optional bucket to write into
) => {
    // If annualScheduleTable has data for this class, populate the schedule
    if (annualScheduleTable && annualScheduleTable.length > 0) {
        let classEntries = annualScheduleTable.filter(
            (entry) => entry.class?.id === selectedClassId,
        );

        // Filter by teacher if teacherId provided
        if (teacherId) {
            classEntries = classEntries.filter(
                (entry) => entry.teacher?.id === teacherId,
            );
        }

        const bucketId = targetKey || selectedClassId; // write into single bucket when needed

        classEntries.forEach((entry) => {
            // Convert day number (1-7) to day name from DAYS_OF_WEEK array (0-based index)
            const dayName = DAYS_OF_WEEK[entry.day - 1];
            
            if (dayName && newSchedule[bucketId][dayName]) {
                if (!newSchedule[bucketId][dayName][entry.hour]) {
                    newSchedule[bucketId][dayName][entry.hour] = {
                        teachers: [],
                        subjects: [],
                        classId: entry.class?.id,
                    };
                } else if (!newSchedule[bucketId][dayName][entry.hour].classId) {
                    newSchedule[bucketId][dayName][entry.hour].classId = entry.class?.id;
                }

                const cell = newSchedule[bucketId][dayName][entry.hour];
                if (entry.teacher?.id && !cell.teachers.includes(entry.teacher.id)) cell.teachers.push(entry.teacher.id);
                if (entry.subject?.id && !cell.subjects.includes(entry.subject.id)) cell.subjects.push(entry.subject.id);
            }

        });
    }
    return newSchedule;
};
