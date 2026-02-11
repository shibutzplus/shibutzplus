import { TeacherType } from "@/models/types/teachers";

// Local storage keys
export const STORAGE_KEYS = {
    TEACHER_DATA: "teacher_data",   // Used by Teacher Portal public pages
};

export const getStorage = <T>(key: string) => {
    if (typeof window === "undefined") return null;
    const storage: string | null = localStorage.getItem(key);
    if (!storage) return null;
    try {
        return JSON.parse(storage) as T;
    } catch {
        return null;
    }
};

export const setStorage = <T>(key: string, value: T) => {
    if (typeof window === "undefined") return false;
    if (!value) return false;
    try {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
    } catch {
        return false;
    }
};

export const clearStorage = () => {
    if (typeof window === "undefined") return;
    localStorage.clear();
};

//
// Current logged in Teacher
//
export const getStorageTeacher = () => {
    return getStorage<TeacherType>(STORAGE_KEYS.TEACHER_DATA);
};

export const setStorageTeacher = (teacher: TeacherType) => {
    // Only store essential fields
    const { id, name, role, schoolId } = teacher;
    const minimalTeacher = { id, name, role, schoolId };
    const success = setStorage(STORAGE_KEYS.TEACHER_DATA, minimalTeacher);

    if (success && typeof window !== "undefined") {
        window.dispatchEvent(new Event("teacher_data_updated"));
    }

    return success;
};

export const removeStorageTeacher = () => {
    if (typeof window === "undefined") return;
    localStorage.removeItem(STORAGE_KEYS.TEACHER_DATA);
};

