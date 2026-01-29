// Session keys
export const SESSION_KEYS = {
    HAMBURGER_EXPANDED_GROUPS: "menu_expanded",
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


