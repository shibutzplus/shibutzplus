import { SelectOption } from "@/models/types";

export const DAYS_OF_WEEK = ["א", "ב", "ג", "ד", "ה", "ו", "ש"];
export const DAYS_OF_WORK_WEEK = ["א", "ב", "ג", "ד", "ה", "ו"];
export const DAYS_OF_WEEK_FORMAT = ["יום א", "יום ב", "יום ג", "יום ד", "יום ה", "יום ו", "יום שבת"];

// Helper to get Israel Date components
export const getIsraelDateComponents = (date: Date = new Date()) => {
    const formatter = new Intl.DateTimeFormat("en-US", {
        timeZone: "Asia/Jerusalem",
        year: "numeric",
        month: "numeric",
        day: "numeric",
        hour: "numeric",
        minute: "numeric",
        second: "numeric",
        hour12: false,
    });

    const parts = formatter.formatToParts(date);
    const part = (type: string) => parts.find((p) => p.type === type)?.value || "";

    return {
        year: parseInt(part("year"), 10),
        month: parseInt(part("month"), 10),
        day: parseInt(part("day"), 10),
        hour: parseInt(part("hour"), 10),
        minute: parseInt(part("minute"), 10),
        second: parseInt(part("second"), 10),
    };
};

export const SUNDAY_NUMBER = 0;
export const SATURDAY_NUMBER = 6;

export const SCHOOL_MONTHS = [
    "ספטמבר", "אוקטובר", "נובמבר", "דצמבר",
    "ינואר", "פברואר", "מרץ", "אפריל", "מאי", "יוני",
    "יולי", "אוגוסט"
];

export const getHebrewMonthName = (monthIndex: number): string => {
    // SCHOOL_MONTHS starts at September (index 0).
    return SCHOOL_MONTHS[(monthIndex + 4) % 12];
};

export const ONE_DAY = 1;

export const DEFAULT_FROM_HOUR = 1;
export const DEFAULT_TO_HOUR = 10;

// Global auto-switch time configuration (HH:MM)
export const AUTO_SWITCH_TIME = "16:00";

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
    const { year, month, day } = getIsraelDateComponents();
    return buildDateString(`${year}`, `${month}`, `${day}`);
};

export const getTomorrowDateString = () => {
    const { year, month, day } = getIsraelDateComponents();
    const today = new Date(year, month - 1, day);
    today.setDate(today.getDate() + 1);
    return getDateReturnString(today);
};

export const getTwoDaysFromNowDateString = () => {
    const { year, month, day } = getIsraelDateComponents();
    const today = new Date(year, month - 1, day);
    today.setDate(today.getDate() + 2);
    return getDateReturnString(today);
};

// -- Day -- //
export const getToday = () => {
    return getTodayDateString();
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
    const { month } = getIsraelDateComponents();
    return month - 1; // getMonth() returns 0-11, our month is 1-12
};

// -- Year -- //
export const getCurrentYear = (): number => {
    const { year } = getIsraelDateComponents();
    return year;
};



export const israelTimezoneDate = () => {
    const { year, month, day, hour, minute, second } = getIsraelDateComponents();
    // Return a date object mimicking Israel time (shifted)
    return new Date(year, month - 1, day, hour, minute, second);
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



// -- Cache -- //

// Cache expiration time (1 hour in milliseconds)
export const CACHE_EXPIRATION = 24 * 60 * 60 * 1000;

// Check if cache is fresh (less than 24 hours old)
export const isCacheFresh = (cacheTimestamp: string | null) =>
    cacheTimestamp && Date.now() - parseInt(cacheTimestamp) < CACHE_EXPIRATION;

// -- Session -- //

export const TWENTY_FOUR_HOURS = 24 * 60 * 60;

export const getExpireTime = (remember: boolean) => {
    const maxAge = remember ? 30 * 24 * 60 * 60 : 60 * 60; // 30d vs 1h
    return Math.floor(Date.now() / 1000) + maxAge;
};

// Returns session duration in seconds
export const getSessionMaxAge = (remember: boolean) => (remember ? 30 * 24 * 60 * 60 : 60 * 60);

export const COOKIES_EXPIRE_TIME = 365;

// -- How much time we keep History in daily schedules table -- //
export const DAILY_KEEP_HISTORY_DAYS = 2;

export const pad2 = (n: number) => {
    return n < 10 ? `0${n}` : `${n}`;
};

export const daysInMonth = (year: number, month1to12: number) => {
    return new Date(year, month1to12, 0).getDate();
};

// -- Date Component Utilities -- //

// Get current date components as strings
export const getTodayDateComponents = () => {
    const { year, month, day } = getIsraelDateComponents();
    return {
        year: `${year}`,
        month: `${month}`,
        day: `${day}`
    };
};

// Build YYYY-MM-DD string from components
export const buildDateString = (year: string, month: string, day: string) => {
    const yNum = parseInt(year, 10);
    const mNum = parseInt(month, 10);
    const dNum = parseInt(day, 10);
    return `${yNum}-${pad2(mNum)}-${pad2(dNum)}`;
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
    const today = getTodayDateString();
    const tomorrow = getTomorrowDateString();

    const [switchHour, switchMinute] = AUTO_SWITCH_TIME.split(":").map(Number);

    // Use the helper to get current Israel time
    const { hour: currentHour, minute: currentMinute } = getIsraelDateComponents();

    const isAfterSwitch =
        currentHour > switchHour || (currentHour === switchHour && currentMinute >= switchMinute);

    // Default time-based date (when no options or fallback needed)
    const defaultTimeBased = isAfterSwitch ? tomorrow : today;

    // Simplified: Always return the time-based default (Today/Tomorrow) based on the switch time.
    // If this date is not in options, PortalContext will handle it as an "Empty Schedule" (NotPublished).
    return defaultTimeBased;
};

// -- School Year -- //
export const getCurrentSchoolYearRange = (): { start: string; end: string } => {
    const { year: currentYear, month: currentMonthVal } = getIsraelDateComponents();
    const currentMonth = currentMonthVal - 1; // 0-11 for logic below

    let startYear: number;
    let endYear: number;

    // School year starts September 1st
    // If current date is Jan-Aug (0-7), we are in the second half of the school year (started prev year)
    // If current date is Sept-Dec (8-11), we are in the first half of the school year (started this year)

    if (currentMonth < 8) {
        // Jan - Aug
        startYear = currentYear - 1;
        endYear = currentYear;
    } else {
        // Sept - Dec
        startYear = currentYear;
        endYear = currentYear + 1;
    }

    const startDate = new Date(startYear, 8, 1); // Sept 1st
    const endDate = new Date(endYear, 7, 31); // Aug 31st

    return {
        start: getDateReturnString(startDate),
        end: getDateReturnString(endDate),
    };
};
