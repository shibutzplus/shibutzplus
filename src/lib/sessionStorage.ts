import { DailyTableLimitNumber, PublishLimitNumber } from "@/models/constant/daily";
import { DailySchedule } from "@/models/types/dailySchedule";

// Session keys
export const SESSION_KEYS = {
    DAILY_TABLE_DATA: "daily_schedule_data",    // Manager Portal
    PUBLISH_DATES: "publish_dates",             // Manager Portal
    HAMBURGER_EXPANDED_GROUPS: "menu_expanded", // Hamburger Menu
};

export const getSessionStorage = <T>(key: string) => {
    const storage: string | null = sessionStorage.getItem(key);
    if (!storage) return null;
    try {
        return JSON.parse(storage) as T;
    } catch {
        return null;
    }
};

export const setSessionStorage = <T>(key: string, value: T) => {
    if (!value) return false;
    try {
        sessionStorage.setItem(key, JSON.stringify(value));
        return true;
    } catch {
        return false;
    }
};

export const removeSessionStorage = (key: string) => {
    try {
        sessionStorage.removeItem(key);
        return true;
    } catch {
        return false;
    }
};

export const clearSessionStorage = () => {
    try {
        sessionStorage.clear();
        return true;
    } catch {
        return false;
    }
};

export const getSessionDailyTable = () => {
    return getSessionStorage<DailySchedule>(SESSION_KEYS.DAILY_TABLE_DATA);
};

export const setSessionDailyTable = (dailyTable: DailySchedule, selectedDate: string) => {
    const existingStorage = getSessionDailyTable() || {};
    const updatedStorage = {
        ...existingStorage,
        [selectedDate]: dailyTable[selectedDate],
    };

    // Maintain a maximum of 14 dates (FIFO)
    const dateKeys = Object.keys(updatedStorage);
    if (dateKeys.length > DailyTableLimitNumber) {
        // Sort dates and remove the oldest ones
        const sortedDates = dateKeys.sort();
        const datesToRemove = sortedDates.slice(0, dateKeys.length - DailyTableLimitNumber);
        datesToRemove.forEach((date) => {
            delete updatedStorage[date];
        });
    }

    return setSessionStorage(SESSION_KEYS.DAILY_TABLE_DATA, updatedStorage);
};

export const getSessionPublishDates = () => {
    return getSessionStorage<string[]>(SESSION_KEYS.PUBLISH_DATES);
};

export const setSessionPublishDates = (publishDate: string) => {
    const existingStorage = getSessionPublishDates() || [];
    // Don't add duplicate dates
    if (existingStorage.includes(publishDate)) {
        return false;
    }
    let updatedStorage = [...existingStorage, publishDate];
    // Maintain a maximum of 6 elements (FIFO)
    if (updatedStorage.length > PublishLimitNumber) {
        updatedStorage = updatedStorage.slice(1);
    }
    return setSessionStorage(SESSION_KEYS.PUBLISH_DATES, updatedStorage);
};

export const removeSessionPublishDates = () => {
    return removeSessionStorage(SESSION_KEYS.PUBLISH_DATES);
};


