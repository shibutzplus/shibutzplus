import { PortalSchedule } from "@/models/types/portalSchedule";
import { TeacherType } from "@/models/types/teachers";

// Session keys
export const SESSION_KEYS = {
    TEACHERS_DATA: "teachers_data",
    PORTAL_TABLE_DATA: "portal_table_data",
};

export const getSessionStorage = <T>(key: string) => {
    const storage: string | null = sessionStorage.getItem(key);
    if (!storage) return null;
    try {
        return JSON.parse(storage) as T;
    } catch (e) {
        return null;
    }
};

export const setSessionStorage = <T>(key: string, value: T) => {
    if (!value) return false;
    try {
        sessionStorage.setItem(key, JSON.stringify(value));
        return true;
    } catch (error) {
        return false;
    }
};

export const removeSessionStorage = (key: string) => {
    try {
        sessionStorage.removeItem(key);
        return true;
    } catch (error) {
        return false;
    }
};

export const clearSessionStorage = () => {
    try {
        sessionStorage.clear();
        return true;
    } catch (error) {
        return false;
    }
};

export const getSessionTeacher = () => {
    return getSessionStorage<TeacherType>(SESSION_KEYS.TEACHERS_DATA);
};

export const setSessionTeacher = (teacher: TeacherType) => {
    return setSessionStorage(SESSION_KEYS.TEACHERS_DATA, teacher);
};

export const clearSessionTeachers = () => {
    return removeSessionStorage(SESSION_KEYS.TEACHERS_DATA);
};

export const getSessionPortalTable = () => {
    return getSessionStorage<PortalSchedule>(SESSION_KEYS.PORTAL_TABLE_DATA);
};

export const setSessionPortalTable = (portalTable: PortalSchedule) => {
    return setSessionStorage(SESSION_KEYS.PORTAL_TABLE_DATA, portalTable);
};

export const clearSessionPortalTable = () => {
    return removeSessionStorage(SESSION_KEYS.PORTAL_TABLE_DATA);
};
