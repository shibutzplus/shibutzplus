// Days of the week in Hebrew
export const DAYS_OF_WEEK = ["א", "ב", "ג", "ד", "ה", "ו"];

export const hoursOfDay = ["1", "2", "3", "4", "5", "6", "7"];

// Number of hours in a day
export const HOURS_IN_DAY = 7;

// Check if cache is fresh (less than 1 hour old)
export const isCacheFresh = (cacheTimestamp: string | null) =>
    cacheTimestamp && Date.now() - parseInt(cacheTimestamp) < 3600000; // 1 hour

// Generate hours from 0 to 8 to match the reference image
export const displayHours = Array.from({ length: hoursOfDay.length + 1 }, (_, i) => i);

export const todayDateFormat = () => {
    return new Date().toISOString().split("T")[0]; // Today's date in YYYY-MM-DD format
};

// Get the current day number (1-7) from the current date
export const getDayNumber = () => {
    const date = new Date();
    // Convert from 0-6 (Sunday-Saturday) to 1-7 (Sunday-Saturday)
    return date.getDay() + 1;
};

export const getDateString = (dayNumber: number) => {
    const date = new Date();
    const year = date.getFullYear();
    const month = date.getMonth();
    const day = date.getDate();
    return `${year}-${month + 1}-${day + dayNumber}`;
};
