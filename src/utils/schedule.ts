import { AnnualScheduleType, WeeklySchedule } from "@/models/types/annualSchedule";
import { DAYS_OF_WEEK } from "./time";

export const populateAnnualSchedule = (
    annualScheduleTable: AnnualScheduleType[] | undefined,
    selectedClassId: string,
    newSchedule: WeeklySchedule,
) => {
    // If annualScheduleTable has data for this class, populate the schedule
    if (annualScheduleTable && annualScheduleTable.length > 0) {
        const classEntries = annualScheduleTable.filter(
            (entry) => entry.class.id === selectedClassId,
        );

        classEntries.forEach((entry) => {
            // Convert day number (1-7) to day name from DAYS_OF_WEEK array (0-based index)
            const dayName = DAYS_OF_WEEK[entry.day - 1];

            if (dayName && newSchedule[selectedClassId][dayName]) {
                newSchedule[selectedClassId][dayName][entry.hour] = {
                    teacher: entry.teacher.id,
                    subject: entry.subject.id,
                };
            }
        });
    }
    return newSchedule;
};
