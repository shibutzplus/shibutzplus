import { DailyScheduleType } from "@/models/types/dailySchedule";

export const DAYS_OF_WEEK = ["א", "ב", "ג", "ד", "ה", "ו", "ש"];
export const SUNDAY_NUMBER = 0;
export const SATURDAY_NUMBER = 6;

export const THREE_WEEKS = 21;
export const ONE_WEEK = 7;
export const THREE_DAYS = 3;

// Number of hours in a day
export const HOURS_IN_DAY = 7;

export const getDateReturnString = (date: Date) => {
    return date.toISOString().split("T")[0];
};

export const getStringReturnDate = (date: string) => {
    return new Date(date);
};

export const getTodayDateString = () => {
    return getDateReturnString(new Date());
};

export const getTomorrowDateString = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return getDateReturnString(tomorrow);
};

// -- Day -- //

export const getDayNumberByDate = (date: Date) => {
    // Get day of week (0 = Sunday, 6 = Saturday)
    return date.getDay(); //TODO for Tuesday (3) I got Monday (2)
};

export const getDayNumberByDateString = (date: string) => {
    return new Date(date).getDay() + 1; //TODO for Tuesday (3) I got Monday (2)
};

export const dayToNumber = (day: string) => {
    //Convert day name to number (1-7)
    return DAYS_OF_WEEK.indexOf(day) + 1;
};

// -- Month -- //
export const getCurrentMonth = (): number => {
    return new Date().getMonth();
};

// -- Year -- //
export const getCurrentYear = (): number => {
    return new Date().getFullYear();
};

// -- Date -- //

export const getDateNumberByDate = (date: Date) => {
    return date.getDate();
};

export const getDateNumberByDateString = (date: string) => {
    return new Date(date).getDate();
};

export const getTodayDateNumber = () => {
    return getDateNumberByDate(new Date());
};

export const israelTimezoneDate = () => {
    // Create date in Israel timezone (UTC+3)
    const now = new Date();
    const israelOffset = 3 * 60; // Israel is UTC+3 (3 hours * 60 minutes)
    const israelTime = new Date(now.getTime() + israelOffset * 60 * 1000);
    return israelTime;
};

export const generateDateRange = (startDate: Date, endDate: Date): string[] => {
    const dates: string[] = [];
    const currentDate = new Date(startDate);
    while (currentDate <= endDate) {
        dates.push(currentDate.toISOString().split("T")[0]); // YYYY-MM-DD format
        currentDate.setDate(currentDate.getDate() + 1);
    }

    return dates;
};

// -- Cache -- //

// Cache expiration time (1 hour in milliseconds)
export const CACHE_EXPIRATION = 60 * 60 * 1000;

// Check if cache is fresh (less than 1 hour old)
export const isCacheFresh = (cacheTimestamp: string | null) =>
    cacheTimestamp && Date.now() - parseInt(cacheTimestamp) < CACHE_EXPIRATION;

// -- Session -- //

export const TWENTY_FOUR_HOURS = 24 * 60 * 60;

export const getExpireTime = (remember: any) => {
    const maxAge = remember ? 30 * 24 * 60 * 60 : 60 * 60; // 30d vs 1h
    return Math.floor(Date.now() / 1000) + maxAge;
};

export const COOKIES_EXPIRE_TIME = 365;

//--

export const getCurrentWeekEntries = (data?: DailyScheduleType[]) => {
    // Filter entries to only include the current week
    const today = new Date();
    const currentDay = today.getDay(); // 0 = Sunday, 6 = Saturday

    // Calculate the start and end of the current week (Sunday to Saturday)
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - currentDay); // Go back to Sunday

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6); // Go forward to Saturday

    // Filter entries to only include the current week
    const currentWeekEntries = data?.filter((entry) => {
        const entryDate = new Date(entry.date);
        return entryDate >= startOfWeek && entryDate <= endOfWeek;
    });

    return currentWeekEntries;
};
