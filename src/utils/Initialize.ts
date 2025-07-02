import { WeeklySchedule } from "@/models/types/annualSchedule";
import { DAYS_OF_WEEK, HOURS_IN_DAY } from "./time";

export const initializeEmptyAnnualSchedule = (
    newSchedule: WeeklySchedule,
    selectedClassId: string,
) => {
    // Initialize empty schedule structure
    newSchedule[selectedClassId] = {};
    DAYS_OF_WEEK.forEach((day) => {
        newSchedule[selectedClassId][day] = {};

        for (let hour = 1; hour <= HOURS_IN_DAY; hour++) {
            newSchedule[selectedClassId][day][hour] = {
                teacher: "",
                subject: "",
            };
        }
    });
    return newSchedule;
};
