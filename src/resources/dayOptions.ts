import { SelectOption } from "@/models/types";
import { DAYS_OF_WEEK } from "@/utils/time";

/**
 * Generates date options for a range of days (1 week before and 2 weeks after the current date)
 * @returns Array of SelectOption with date values in YYYY-MM-DD format and labels showing date and Hebrew day of week
 */
export const getDayOptions = (): SelectOption[] => {
    const today = new Date();
    const options: SelectOption[] = [];

    // Start from 7 days ago
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - 7);

    // Generate options for 21 days (1 week before + today + 2 weeks after)
    for (let i = 0; i < 21; i++) {
        // Create a new date object for each day to avoid modifying the reference
        const currentDate = new Date(startDate);
        currentDate.setDate(startDate.getDate() + i);

        // Format date as YYYY-MM-DD
        const dateValue = currentDate.toISOString().split("T")[0];

        // Get day of week (0 = Sunday, 6 = Saturday)
        const dayOfWeek = currentDate.getDay();

        // Skip Saturday
        if (DAYS_OF_WEEK[dayOfWeek] === "ש") {
            continue;
        }

        // Check if this date is today and add 'today' text if it is
        const isToday =
            currentDate.toISOString().split("T")[0] === today.toISOString().split("T")[0];
        const label = `${dateValue} | יום ${DAYS_OF_WEEK[dayOfWeek]}${isToday ? " (היום)" : ""}`;

        options.push({
            value: dateValue,
            label: label,
        });
    }

    return options;
};

export const getTodayOption = () => {
    const today = new Date();
    const dateValue = today.toISOString().split("T")[0];
    return dateValue;
};

export const getTomorrowOption = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateValue = tomorrow.toISOString().split("T")[0];
    return dateValue;
};
