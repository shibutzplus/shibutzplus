import { SelectOption } from "@/models/types";
import { DailyScheduleType } from "@/models/types/dailySchedule";

export const DAYS_OF_WEEK = ["א", "ב", "ג", "ד", "ה", "ו", "ש"];
export const DAYS_OF_WORK_WEEK = ["א", "ב", "ג", "ד", "ה", "ו"];
export const DAYS_OF_WEEK_FORMAT = ["יום א", "יום ב", "יום ג", "יום ד", "יום ה", "יום ו", "יום שבת"];
export const SUNDAY_NUMBER = 0;
export const SATURDAY_NUMBER = 6;

export const THREE_WEEKS = 21;
export const ONE_WEEK = 7;
export const ONE_DAY = 1;

// Number of hours in a day
export const HOURS_IN_DAY = 10;

// Global auto-switch time configuration (HH:MM)
export const AUTO_SWITCH_TIME = "16:00";

// YYYY-MM-DD format
// YYYY-MM-DD format
export const getDateReturnString = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
};

// DD-MM-YYYY format
export const formatTMDintoDMY = (date: string) => {
    const [year, month, day] = date.split("-");
    return `${day}-${month}-${year}`;
};

export const isYYYYMMDD = (s: string) => {
    return /^\d{4}-\d{2}-\d{2}$/.test(s);
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

// Returns the day number of week for a given day name (e.g., "א", "ב", etc.)
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
export const CACHE_EXPIRATION = 24 * 60 * 60 * 1000;

// Check if cache is fresh (less than 24 hours old)
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

// -- History -- //

export const pad2 = (n: number) => {
    return n < 10 ? `0${n}` : `${n}`;
};

export const daysInMonth = (year: number, month1to12: number) => {
    return new Date(year, month1to12, 0).getDate();
};

// -- Date Component Utilities -- //

// Get current date components as strings
export const getCurrentDateComponents = () => {
    const now = new Date();
    const year = `${now.getFullYear()}`;
    const month = `${now.getMonth() + 1}`; // 1-12
    const day = `${now.getDate()}`;
    return { year, month, day };
};

// Parse YYYY-MM-DD string into components
export const parseDateString = (dateStr: string) => {
    if (!isYYYYMMDD(dateStr)) return null;

    const year = dateStr.slice(0, 4);
    const month = String(parseInt(dateStr.slice(5, 7), 10)); // "1".."12"
    const day = String(parseInt(dateStr.slice(8, 10), 10)); // "1".."31"

    return { year, month, day };
};

// Build YYYY-MM-DD string from components
export const buildDateString = (year: string, month: string, day: string) => {
    const yNum = parseInt(year, 10);
    const mNum = parseInt(month, 10);
    const dNum = parseInt(day, 10);
    return `${yNum}-${pad2(mNum)}-${pad2(dNum)}`;
};

// Get today's date as YYYY-MM-DD string
export const getTodayString = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const day = now.getDate();
    return `${year}-${pad2(month)}-${pad2(day)}`;
};

// Get initial month for school year (fallback to September if July/August)
export const getSchoolYearInitialMonth = () => {
    const currentMonth = new Date().getMonth() + 1; // 1-12
    return currentMonth === 7 || currentMonth === 8 ? "9" : `${currentMonth}`;
};

// Generate day options for select dropdown
export const generateDayOptions = (year: string, month: string) => {
    const yNum = parseInt(year, 10);
    const mNum = parseInt(month, 10);
    const maxDays = daysInMonth(yNum, mNum);

    return Array.from({ length: maxDays }, (_, i) => {
        const d = i + 1;
        return { value: `${d}`, label: `${d}` };
    });
};

// Validate and clamp day to valid range for given month/year
export const clampDayToMonth = (day: string, year: string, month: string) => {
    const dNum = parseInt(day, 10);
    const yNum = parseInt(year, 10);
    const mNum = parseInt(month, 10);
    const maxDays = daysInMonth(yNum, mNum);

    return dNum > maxDays ? `${maxDays}` : day;
};

// Choose default date based on current time (before/after AUTO_SWITCH_TIME)
// - Before switch time: prefer today if exists, else first available
// - After switch time: prefer tomorrow if exists, else today, else first available
// Choose default date based on current time (before/after AUTO_SWITCH_TIME)
// - Before switch time: prefer today if exists.
// - After switch time: prefer tomorrow if exists, else today.
// - If options empty/undefined: return today/tomorrow based on time.
export const chooseDefaultDate = (_options?: SelectOption[]): string => {
    const now = new Date();
    const today = getTodayDateString();
    const tomorrow = getTomorrowDateString();

    const [switchHour, switchMinute] = AUTO_SWITCH_TIME.split(":").map(Number);
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();

    const isAfterSwitch =
        currentHour > switchHour || (currentHour === switchHour && currentMinute >= switchMinute);

    // Default time-based date (when no options or fallback needed)
    const defaultTimeBased = isAfterSwitch ? tomorrow : today;

    // Simplified: Always return the time-based default (Today/Tomorrow) based on the switch time.
    // If this date is not in options, PortalContext will handle it as an "Empty Schedule" (NotPublished).
    return defaultTimeBased;
};
