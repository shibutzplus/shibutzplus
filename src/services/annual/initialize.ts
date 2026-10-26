import { WeeklySchedule } from "@/models/types/annualSchedule";
import { DAYS_OF_WEEK } from "@/utils/time";

export const initializeEmptyAnnualSchedule = (
    newSchedule: WeeklySchedule,
    selectedClassId: string,
    fromHour: number = 1,
    toHour: number = 10,
) => {
    // Initialize empty schedule structure
    newSchedule[selectedClassId] = {};
    DAYS_OF_WEEK.forEach((day) => {
        newSchedule[selectedClassId][day] = {};

        for (let hour = fromHour; hour <= toHour; hour++) {
            newSchedule[selectedClassId][day][hour] = {
                teachers: [],
                subjects: [],
                classes: [],
            };
        }
    });
    return newSchedule;
};
