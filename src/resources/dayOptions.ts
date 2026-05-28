import { SelectOption } from "@/models/types";
import {
    DAYS_OF_WEEK, getDateReturnString, getDayNumberByDate, getTodayDateString,
    getTomorrowDateString, SATURDAY_NUMBER, israelTimezoneDate, generateDateRange,
    getCurrentMonth, getCurrentYear, DAYS_OF_WEEK_FORMAT, formatTMDintoDMY,
    AUTO_SWITCH_TIME, getIsraelDateComponents, getTwoDaysFromNowDateString,
} from "@/utils/time";

// Used in Daily Schedule
export function getIsraeliDateOptions(short: boolean = false): SelectOption[] {

    // 1. Determine "Time State" (Before/After 16:00)
    const israelTodayComponents = getIsraelDateComponents();
    const { hour: currentHour, minute: currentMinute, year, month, day } = israelTodayComponents;
    const [switchHour, switchMinute] = AUTO_SWITCH_TIME.split(":").map(Number);
    const isAfterSwitch = currentHour > switchHour ||
        (currentHour === switchHour && currentMinute >= switchMinute);

    // 2. Define Date Range (Yesterday -> June 30th of the current school year)
    const israelToday = new Date(year, month - 1, day, currentHour, currentMinute);
    const start = new Date(israelToday);
    start.setDate(start.getDate() - 1);

    const currentMonth = month - 1; // 0-11
    const endYear = currentMonth >= 8 ? year + 1 : year;
    let end = new Date(endYear, 5, 30); // June 30th

    if (end < start) {
        end = new Date(israelToday);
        end.setMonth(end.getMonth() + 1);
    }

    // 3. Constants for comparison
    const todayStr = getDateReturnString(israelToday);
    const tomorrowStr = getTomorrowDateString();

    // 4. Generate & Map
    return generateDateRange(start, end)
        .map(dateStr => {
            const date = new Date(dateStr);
            return { dateStr, date, dayOfWeek: date.getDay() };
        })
        .filter(({ dayOfWeek }) => dayOfWeek !== SATURDAY_NUMBER) // Filter Saturdays
        .map(({ dateStr, date, dayOfWeek }) => {
            const hebrewDay = DAYS_OF_WEEK_FORMAT[dayOfWeek];

            // Format Date (DD-MM-YYYY or DD-MM)
            let dateDisplay = formatTMDintoDMY(dateStr);
            if (short) {
                const [d, m] = dateDisplay.split("-");
                dateDisplay = `${d}-${m}`;
            }

            let label = `${dateDisplay} | ${hebrewDay}`;

            // Add Contextual Label (Today/Tomorrow)
            if (!isAfterSwitch && dateStr === todayStr) {
                label += " (היום)";
            } else if (isAfterSwitch && dateStr === tomorrowStr) {
                label += " (מחר)";
            }

            return { value: dateStr, label };
        });
}

export function getPublishedDatesOptions(dates: string[]): SelectOption[] {
    const todayStr = getTodayDateString();

    return dates
        .filter(d => d >= todayStr)                 // keep today and future only
        .sort()
        .map(dateStr => {
            const formatted = formatTMDintoDMY(dateStr); // DD-MM-YYYY for display
            const dayOfWeek = new Date(dateStr).getDay();
            return {
                value: dateStr,
                label: `${formatted} | ${DAYS_OF_WEEK_FORMAT[dayOfWeek]}`
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