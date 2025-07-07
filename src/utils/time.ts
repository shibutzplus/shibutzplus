import { DailyScheduleType } from "@/models/types/dailySchedule";

export const DAYS_OF_WEEK = ["א", "ב", "ג", "ד", "ה", "ו", "ש"];

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

export const dateString = (date: Date) => {
    return date.toISOString().split("T")[0];
};

export const stringDate = (date: string) => {
    return new Date(date);
};

export const getColumnDate = (dayNumber: number): Date => {
    return new Date();
    // TODO - need to handle the day number per current date
};

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

export const getDayNumberByDate = (date: string) => {
    return new Date(date).getDay(); //TODO for Tuesday (3) I got Monday (2)
};

// const date = new Date();
//     const year = date.getFullYear();
//     const month = date.getMonth();
//     const day = date.getDate();
//     return `${day}-${month + 1}-${year}|${dayNumber}`;
