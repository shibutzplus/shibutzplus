import { DailyScheduleType } from "@/models/types/dailySchedule";

export const DAYS_OF_WEEK = ["א", "ב", "ג", "ד", "ה", "ו", "ש"];
export const DAYS_OF_WORK_WEEK = ["א", "ב", "ג", "ד", "ה", "ו"];
export const DAYS_OF_WEEK_FORMAT = ["יום א", "יום ב", "יום ג", "יום ד", "יום ה", "יום ו", "יום ש"];
export const SUNDAY_NUMBER = 0;
export const SATURDAY_NUMBER = 6;

export const THREE_WEEKS = 21;
export const ONE_WEEK = 7;
export const THREE_DAYS = 3;

// Number of hours in a day
export const HOURS_IN_DAY = 9;

// YYYY-MM-DD format
export const getDateReturnString = (date: Date) => {
    return date.toISOString().split("T")[0];
};

// DD-MM-YYYY format
export const formatTMDintoDMY = (date: string) => {
    const [year, month, day] = date.split("-");
    return `${day}-${month}-${year}`;
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

export const getTwoDaysFromNowDateString = () => {
    const twoDaysFromNow = new Date();
    twoDaysFromNow.setDate(twoDaysFromNow.getDate() + 2);
    return getDateReturnString(twoDaysFromNow);
};

// -- Day -- //

export const getToday = () => {
    return getDateReturnString(new Date());
};

export const getDayNumberByDate = (date: Date) => {
    // Get day of week (0 = Sunday, 6 = Saturday)
    return date.getDay();
};

export const getDayNumberByDateString = (date: string) => {
    return new Date(date).getDay() + 1;
};

// Returns the day of week in Hebrew (e.g., "א", "ב", etc.) for a given date string (YYYY-MM-DD)
export const getDayNameByDateString = (date: string) => {
    const dayIdx = new Date(date).getDay(); // 0 = Sunday
    return DAYS_OF_WEEK[dayIdx];
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
        dates.push(getDateReturnString(currentDate));
        currentDate.setDate(currentDate.getDate() + 1);
    }

    return dates;
};

// current date in Israel timezone
export const israelToday = new Date(
    new Date().toLocaleString("en-US", { timeZone: "Asia/Jerusalem" }),
);

// -- Cache -- //

// Cache expiration time (1 hour in milliseconds)
export const CACHE_EXPIRATION = 60 * 60 * 1000;

// Check if cache is fresh (less than 1 hour old)
export const isCacheFresh = (cacheTimestamp: string | null) =>
    cacheTimestamp && Date.now() - parseInt(cacheTimestamp) < CACHE_EXPIRATION;

// -- Session -- //
export const mathFloorNow = Math.floor(Date.now() / 1000);

export const TWENTY_FOUR_HOURS = 24 * 60 * 60;

export const getExpireTime = (remember: any) => {
    const maxAge = remember ? 30 * 24 * 60 * 60 : 60 * 60; // 30d vs 1h
    return mathFloorNow + maxAge;
};

// Returns session duration in seconds
export const getSessionMaxAge = (remember: boolean) => (remember ? 30 * 24 * 60 * 60 : 60 * 60);

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
