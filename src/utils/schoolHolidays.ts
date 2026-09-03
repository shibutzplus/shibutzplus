import { HDate } from "@hebcal/core";

/**
 * Returns true if the given date falls within an Israeli Ministry of Education holiday period.
 * Uses getSchoolHolidayName to consistently cover all holidays:
 * Rosh Hashanah, Yom Kippur, Sukkot, Hanukkah, Purim, Passover, Independence Day, Lag BaOmer, Shavuot.
 */
export function isIsraeliSchoolHoliday(date: Date): boolean {
    return getSchoolHolidayName(date) !== null;
}

/**
 * Returns the end date of the current school year (June 30).
 * If the given date is September–December, the school year ends June 30 of the NEXT calendar year.
 * If January–June, it ends June 30 of the SAME calendar year.
 */
export function getSchoolYearEndDate(dateStr: string): string {
    return getSchoolYearRange(new Date(dateStr)).endDate;
}

/**
 * Returns a list of weekly dates starting from the week AFTER startDateStr,
 * skipping Israeli school holidays, up to and including the school year end date.
 * All dates are in "YYYY-MM-DD" format.
 */
export function getWeeklyEventDates(startDateStr: string): string[] {
    const endDateStr = getSchoolYearEndDate(startDateStr);
    const endDate = new Date(endDateStr);
    endDate.setHours(23, 59, 59, 999);

    const dates: string[] = [];
    const current = new Date(startDateStr);

    // Start from next week
    current.setDate(current.getDate() + 7);

    while (current <= endDate) {
        if (!isIsraeliSchoolHoliday(new Date(current))) {
            const y = current.getFullYear();
            const m = String(current.getMonth() + 1).padStart(2, "0");
            const d = String(current.getDate()).padStart(2, "0");
            dates.push(`${y}-${m}-${d}`);
        }
        current.setDate(current.getDate() + 7);
    }

    return dates;
}

/**
 * Returns true if the given string looks like a DD-MM-YYYY date string.
 * Used to decide if an event title is a date (and should be recalculated per week)
 * or a custom name (and should be copied as-is).
 */
export function isDateString(str: string): boolean {
    return /^\d{2}-\d{2}-\d{4}$/.test(str);
}

/**
 * Given a target date in "YYYY-MM-DD" format, returns the corresponding
 * display title in "DD-MM-YYYY" format.
 */
export function dateStringToTitle(dateStr: string): string {
    const [year, month, day] = dateStr.split("-");
    return `${day}-${month}-${year}`;
}

/**
 * Returns the exact Hebrew holiday name if the given date is an Israeli school holiday/vacation day.
 * Returns null if it is a regular school day.
 */
export function getSchoolHolidayName(date: Date): string | null {
    const hDate = new HDate(date);
    const month = hDate.getMonthName();
    const day = hDate.getDate();

    if (month === "Elul" && day === 29) return "ערב ראש השנה 🍎";
    if (month === "Tishrei") {
        if (day === 1 || day === 2) return "ראש השנה 🍎";
        if (day === 9) return "ערב יום כיפור ⚖️";
        if (day === 10) return "יום כיפור ⚖️";
        if (day === 14) return "ערב סוכות 🌴";
        if (day >= 15 && day <= 21) return "חופשת סוכות 🌴";
        if (day === 22) return "שמחת תורה 🌴";
        if (day === 23) return "אסרו חג 🌴";
    }
    if (month === "Kislev" && day >= 25) return "חופשת חנוכה 🕎";
    if (month === "Tevet" && day <= 3) return "חופשת חנוכה 🕎";
    if (month === "Adar I" || month === "Adar II" || month === "Adar") {
        if (day === 13) return "תענית אסתר 🎭";
        if (day === 14 || day === 15) return "חופשת פורים 🎭";
    }
    if (month === "Nisan" && day >= 6 && day <= 22) {
        if (day === 14) return "ערב פסח 🍷";
        if (day === 22) return "אסרו חג 🍷";
        return "חופשת פסח 🍷";
    }
    if (month === "Iyyar") {
        if (day === 4) return "יום הזיכרון 🕯️";
        if (day === 5) return "יום העצמאות 🇮🇱";
        if (day === 18) return "ל\"ג בעומר 🔥";
    }
    if (month === "Sivan") {
        if (day === 5) return "ערב שבועות 🧀";
        if (day === 6) return "שבועות 🧀";
        if (day === 7) return "אסרו חג 🧀";
    }
    return null;
}

/**
 * Returns the start and end dates of the school year (1 September to 30 June)
 * for the school year containing the reference date.
 */
export function getSchoolYearRange(referenceDate: Date = new Date()): { startDate: string; endDate: string } {
    const year = referenceDate.getFullYear();
    const month = referenceDate.getMonth() + 1; // 1-12

    const startYear = month >= 9 ? year : year - 1;
    const endYear = startYear + 1;

    return {
        startDate: `${startYear}-09-01`,
        endDate: `${endYear}-06-30`,
    };
}

/**
 * Returns all school holiday dates (Sunday to Friday only) for the current school year (1 Sept - 30 June).
 */
export function getAllSchoolHolidaysForYear(referenceDate: Date = new Date()): {
    date: string;
    holidayName: string;
    dayNumber: number;
}[] {
    const { startDate, endDate } = getSchoolYearRange(referenceDate);
    const results: { date: string; holidayName: string; dayNumber: number }[] = [];

    const current = new Date(`${startDate}T12:00:00Z`);
    const end = new Date(`${endDate}T12:00:00Z`);

    while (current <= end) {
        const dayOfWeek = current.getUTCDay(); // 0 = Sun, 6 = Sat
        if (dayOfWeek !== 6) { // Skip Saturday (Shabbat)
            const holidayName = getSchoolHolidayName(new Date(current));
            if (holidayName) {
                const y = current.getUTCFullYear();
                const m = String(current.getUTCMonth() + 1).padStart(2, "0");
                const d = String(current.getUTCDate()).padStart(2, "0");
                results.push({
                    date: `${y}-${m}-${d}`,
                    holidayName,
                    dayNumber: dayOfWeek + 1, // ShibutzPlus day convention: 1 = Sun, ..., 6 = Fri
                });
            }
        }
        current.setUTCDate(current.getUTCDate() + 1);
    }

    return results;
}

