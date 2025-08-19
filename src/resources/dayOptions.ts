import { SelectOption } from "@/models/types";
import {
    DAYS_OF_WEEK,
    getDateReturnString,
    getDayNumberByDate,
    getTodayDateString,
    getTomorrowDateString,
    ONE_WEEK,
    SATURDAY_NUMBER,
    THREE_DAYS,
    israelTimezoneDate,
    generateDateRange,
    getCurrentMonth,
    getCurrentYear,
} from "@/utils/time";

/**
 * Generates date options for a range of days (3 days before and 2 weeks after the current date)
 * @returns Array of SelectOption with date values in YYYY-MM-DD format (getDateReturnString)
 * and labels showing date and day of week
 */
export const getDayOptions = (): SelectOption[] => {
    const israelTime = israelTimezoneDate();

    const options: SelectOption[] = [];

    // Start from 3 days ago
    const startDate = new Date(israelTime);
    startDate.setDate(israelTime.getDate() - THREE_DAYS);

    // Generate options for 17 days (3 days before + today + 2 weeks after)
    for (let i = 0; i < THREE_DAYS + 1 + ONE_WEEK * 2; i++) {
        // Create a new date object for each day to avoid modifying the reference
        const currentDate = new Date(startDate);
        currentDate.setDate(startDate.getDate() + i);

        const dateValue = getDateReturnString(currentDate);
        const dayOfWeek = getDayNumberByDate(currentDate);

        // Skip Saturday
        if (dayOfWeek === SATURDAY_NUMBER) continue;

        // Check if this date is today and add 'today' text if it is
        const todayString = getDateReturnString(israelTime);
        const tomorrowDate = new Date(israelTime);
        tomorrowDate.setDate(israelTime.getDate() + 1);
        const tomorrowString = getDateReturnString(tomorrowDate);

        const isToday = dateValue === todayString;
        const isTomorrow = dateValue === tomorrowString;
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

/**
 * Generates date options for all days from September 1st of the current school year until today
 * @returns Array of SelectOption with date values in YYYY-MM-DD format and labels showing date and day of week
 */
export const getYearDayOptions = (): SelectOption[] => {
    const israelTime = israelTimezoneDate();
    const currentYear = getCurrentYear();
    const currentMonth = getCurrentMonth();
    
    // School year starts in September and ends in August of the following year
    // If we're in September-December, use current year's September 1st
    // If we're in January-August, use previous year's September 1st
    const schoolYear = currentMonth >= 8 ? currentYear : currentYear - 1;
    const startDate = new Date(`${schoolYear}-09-01`);
    const endDate = israelTime;
    
    // Generate all dates in the range
    const allDates = generateDateRange(startDate, endDate);
    
    const options: SelectOption[] = [];
    const todayString = getDateReturnString(israelTime);
    const tomorrowDate = new Date(israelTime);
    tomorrowDate.setDate(israelTime.getDate() + 1);
    const tomorrowString = getDateReturnString(tomorrowDate);
    
    allDates.forEach(dateValue => {
        const currentDate = new Date(dateValue);
        const dayOfWeek = getDayNumberByDate(currentDate);
        
        // Skip Saturday
        if (dayOfWeek === SATURDAY_NUMBER) return;
        
        const isToday = dateValue === todayString;
        const isTomorrow = dateValue === tomorrowString;
        const label = `${dateValue} | יום ${DAYS_OF_WEEK[dayOfWeek]}${isToday ? " (היום)" : ""}${isTomorrow ? " (מחר)" : ""}`;
        
        options.push({
            value: dateValue,
            label: label,
        });
    });
    
    return options.reverse(); // Most recent dates first
};

