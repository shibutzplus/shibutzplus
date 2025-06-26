export const CACHE_DURATION_1_HOUR = 60 * 60; // 1 hour

// Days of the week in Hebrew
export const DAYS_OF_WEEK = ["א", "ב", "ג", "ד", "ה", "ו"];

// Number of hours in a day
export const HOURS_IN_DAY = 7;

// Check if cache is fresh (less than 1 hour old)
export const isCacheFresh = (cacheTimestamp: string | null) =>
    cacheTimestamp && Date.now() - parseInt(cacheTimestamp) < 3600000; // 1 hour
