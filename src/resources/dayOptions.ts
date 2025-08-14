import { SelectOption } from "@/models/types";
import {
    DAYS_OF_WEEK,
    getDateNumberByDate,
    getDateReturnString,
    getDayNumberByDate,
    getTodayDateNumber,
    getTodayDateString,
    getTomorrowDateString,
    ONE_WEEK,
    SATURDAY_NUMBER,
    THREE_WEEKS,
} from "@/utils/time";

/**
 * Generates date options for a range of days (1 week before and 2 weeks after the current date)
 * @returns Array of SelectOption with date values in YYYY-MM-DD format (getDateReturnString) 
 * and labels showing date and day of week
 */
export const getDayOptions = (): SelectOption[] => {
    const today = new Date();
    const options: SelectOption[] = [];

    // Start from 7 days ago
    const startDate = new Date(today);
    startDate.setDate(getTodayDateNumber() - ONE_WEEK);

    // Generate options for 21 days (1 week before + today + 2 weeks after)
    for (let i = 0; i < THREE_WEEKS; i++) {
        // Create a new date object for each day to avoid modifying the reference
        const currentDate = new Date(startDate);
        currentDate.setDate(getDateNumberByDate(startDate) + i);

        const dateValue = getDateReturnString(currentDate);
        const dayOfWeek = getDayNumberByDate(currentDate);

        // Skip Saturday
        if (dayOfWeek === SATURDAY_NUMBER) continue;

        // Check if this date is today and add 'today' text if it is
        const isToday = getDateReturnString(currentDate) === getTodayDateString();
        const isTomorrow = getDateReturnString(currentDate) === getTomorrowDateString();
        const label = `${dateValue} | יום ${DAYS_OF_WEEK[dayOfWeek]}${isToday ? " (היום)" : ""}${isTomorrow ? " (מחר)" : ""}`;

        options.push({
            value: dateValue,
            label: label,
        });
    }

    return options;
};

export const getTodayOption = () => {
    return getTodayDateString();
};

export const getTomorrowOption = () => {
    return getTomorrowDateString();
};
