import { SchoolType } from "@/models/types/school";
import { SubjectType } from "@/models/types/subjects";
import { TeacherType } from "@/models/types/teachers";
import { STORAGE_KEYS } from "@/resources/storage";
import { ClassType } from "@/models/types/classes";
import { DailySchedule } from "@/models/types/dailySchedule";

export const getStorage = <T>(key: string) => {
    const storage: string | null = localStorage.getItem(key);
    if (!storage) return null;
    try {
        return JSON.parse(storage) as T;
    } catch (e) {
        return null;
    }
};

export const setStorage = <T>(key: string, value: T) => {
    if (!value) return false;
    try {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
    } catch (error) {
        return false;
    }
};

export const getCacheTimestamp = () => {
    return getStorage<string>(STORAGE_KEYS.CACHE_TIMESTAMP);
};

export const setCacheTimestamp = (timestamp: string) => {
    return setStorage(STORAGE_KEYS.CACHE_TIMESTAMP, timestamp);
};

export const getStorageSchoolId = () => {
    return getStorage<string>(STORAGE_KEYS.SCHOOL_ID);
};

export const setStorageSchoolId = (schoolId: string) => {
    return setStorage(STORAGE_KEYS.SCHOOL_ID, schoolId);
};

export const getStorageSchool = () => {
    return getStorage<SchoolType>(STORAGE_KEYS.SCHOOL_DATA);
};

export const setStorageSchool = (school: SchoolType) => {
    return setStorage(STORAGE_KEYS.SCHOOL_DATA, school);
};

export const getStorageTeachers = () => {
    return getStorage<TeacherType[]>(STORAGE_KEYS.TEACHERS_DATA);
};

export const setStorageTeachers = (teachers: TeacherType[]) => {
    return setStorage(STORAGE_KEYS.TEACHERS_DATA, teachers);
};

export const getStorageSubjects = () => {
    return getStorage<SubjectType[]>(STORAGE_KEYS.SUBJECTS_DATA);
};

export const setStorageSubjects = (subjects: SubjectType[]) => {
    return setStorage(STORAGE_KEYS.SUBJECTS_DATA, subjects);
};

export const getStorageClasses = () => {
    return getStorage<ClassType[]>(STORAGE_KEYS.CLASSES_DATA);
};

export const setStorageClasses = (classes: ClassType[]) => {
    return setStorage(STORAGE_KEYS.CLASSES_DATA, classes);
};

export const getStorageDailyTable = () => {
    return getStorage<DailySchedule>(STORAGE_KEYS.DAILY_TABLE_DATA);
}

export const setStorageDailyTable = (dailyTable: DailySchedule, selectedDate: string) => {
    const existingStorage = getStorageDailyTable() || {};
    const updatedStorage = {
        ...existingStorage,
        [selectedDate]: dailyTable[selectedDate]
    };
    return setStorage(STORAGE_KEYS.DAILY_TABLE_DATA, updatedStorage);
}

export const clearStorage = () => {
    localStorage.clear();
};

// Store and retrieve the order of daily schedule columns
export const getStorageDailyColumnsOrder = (): Record<string, string[]> => {
    try {
        const raw = localStorage.getItem("shibutzplus_daily_table_order");
        return raw ? (JSON.parse(raw) as Record<string, string[]>) : {};
    } catch {
        return {};
    }
};

export const setStorageDailyColumnsOrder = (date: string, ids: string[]) => {
    const all = getStorageDailyColumnsOrder();
    all[date] = ids;
    localStorage.setItem("shibutzplus_daily_table_order", JSON.stringify(all));
};

// Clean up shibutzplus_daily_table_order: remove keys older than `maxAgeDays`, then keep only `maxKeep` most recent date keys.
// Works with current schema: Record<string, string[]>, where keys are ISO dates (YYYY-MM-DD).
export const cleanupDailyColumnsOrder = (maxAgeDays = 7, maxKeep = 7) => {
    const raw = localStorage.getItem("shibutzplus_daily_table_order");
    if (!raw) return;

    let map: Record<string, string[]>;
    try {
        map = JSON.parse(raw) as Record<string, string[]>;
    } catch {
        return;
    }

    const today = new Date();
    const cutoff = new Date(today);
    cutoff.setDate(today.getDate() - maxAgeDays);

    // 1) time-based purge: drop keys older than cutoff
    const kept: Array<{ key: string; date: Date }> = [];
    for (const key of Object.keys(map)) {
        // Expecting keys like "YYYY-MM-DD"
        const d = new Date(key);
        if (!isNaN(d.getTime()) && d >= cutoff) {
            kept.push({ key, date: d });
        } else {
            delete map[key];
        }
    }

    // 2) count-based cap: keep only `maxKeep` most recent keys
    kept.sort((a, b) => b.date.getTime() - a.date.getTime());
    const toKeep = new Set(kept.slice(0, maxKeep).map(k => k.key));
    for (const k of Object.keys(map)) {
        if (!toKeep.has(k)) delete map[k];
    }

    localStorage.setItem("shibutzplus_daily_table_order", JSON.stringify(map));
};
