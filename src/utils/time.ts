export const CACHE_DURATION_1_HOUR = 60 * 60; // 1 hour

export const isLessThan1HourOld = (cacheTimestamp: string) => {
    return Date.now() - parseInt(cacheTimestamp) < 3600000;
};
