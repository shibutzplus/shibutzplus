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
    israelToday,
    DAYS_OF_WEEK_FORMAT,
    formatTMDintoDMY,
} from "@/utils/time";

export function getIsraeliDateOptions(): SelectOption[] {
    const options: SelectOption[] = [];

    // Helper function to format date and create option
    const createDateOption = (date: Date): SelectOption => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        const dateString = `${year}-${month}-${day}`;

        const dayOfWeek = date.getDay();
        const hebrewDay = DAYS_OF_WEEK_FORMAT[dayOfWeek];

        // Check if it's today or tomorrow
        const tomorrow = new Date(israelToday);
        tomorrow.setDate(israelToday.getDate() + 1);

        let label = `${formatTMDintoDMY(dateString)} | ${hebrewDay}`;

        if (date.toDateString() === israelToday.toDateString()) {
            label += " (היום)";
        } else if (date.toDateString() === tomorrow.toDateString()) {
            label += " (מחר)";
        }

        return {
            value: dateString,
            label: label,
        };
    };

    // Calculate start date (3 days ago) and end date (2 weeks from today)
    const startDate = new Date(israelToday);
    startDate.setDate(israelToday.getDate() - THREE_DAYS);

    const endDate = new Date(israelToday);
    endDate.setDate(israelToday.getDate() + ONE_WEEK * 2);

    // Generate all dates in the range
    const currentDate = new Date(startDate);
    while (currentDate <= endDate) {
        options.push(createDateOption(new Date(currentDate)));
        currentDate.setDate(currentDate.getDate() + 1);
    }

    // Filter out Saturday days ('יום ש')
    const filteredOptions = options.filter((option) => !option.label.includes("יום ש"));

    return filteredOptions;
}

export function getPublishedDatesOptions(dates: string[]): SelectOption[] {
    const todayStr = new Date().toISOString().slice(0, 10);

    return dates
        .filter((d) => d >= todayStr) // keep today and future only
        .sort()
        .map((dateStr) => {
            const formatted = formatTMDintoDMY(dateStr); // DD-MM-YYYY for display
            const dayOfWeek = new Date(dateStr).getDay();
            return {
                value: dateStr,
                label: `${formatted} | ${DAYS_OF_WEEK_FORMAT[dayOfWeek]}`,
            };
        });
}

export const getTodayOption = () => {
    const today = new Date(getTodayDateString());
    if (today.getDay() === SATURDAY_NUMBER) {
        // If today is Saturday, return tomorrow (Sunday)
        return getTomorrowDateString();
    }
    return getTodayDateString();
};

import { getTwoDaysFromNowDateString } from "@/utils/time";

export const getTomorrowOption = () => {
    const tomorrow = new Date(getTomorrowDateString());
    if (tomorrow.getDay() === SATURDAY_NUMBER) {
        // If tomorrow is Saturday, return two days from now (Sunday)
        return getTwoDaysFromNowDateString();
    }
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

    allDates.forEach((dateValue) => {
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
