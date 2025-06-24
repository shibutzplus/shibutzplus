export const CACHE_DURATION_1_HOUR = 60 * 60; // 1 hour

export const isLessThan1HourOld = (cacheTimestamp: string) => {
    return Date.now() - parseInt(cacheTimestamp) < 3600000;
};

// Days of the week in Hebrew
export const DAYS_OF_WEEK = ["א", "ב", "ג", "ד", "ה", "ו"];

// Number of hours in a day
export const HOURS_IN_DAY = 7;
