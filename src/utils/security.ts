import { MAX_DAILY_COLUMNS } from "@/models/constant/table";

/**
 * Security utility to check if the maximum number of daily columns has been reached.
 * @param currentColumnCount The current number of columns in the daily schedule.
 * @returns true if more columns can be added, false otherwise.
 */
export const validateMaxColumns = (currentColumnCount: number): boolean => {
    return currentColumnCount < MAX_DAILY_COLUMNS;
};
