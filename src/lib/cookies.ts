import Cookies from "js-cookie";
import { COOKIES_EXPIRE_TIME } from "@/utils/time";

// Cookies keys
export const COOKIES_KEYS = {
    FFU: "shibutz_ffu",
    ROTATE_DEVICE_TOAST: "shibutz_rotate_device",
};

export const getCookie = <T = string>(key: string): T | null => {
    try {
        const cookie = Cookies.get(key);
        if (!cookie) return null;
        try {
            return JSON.parse(cookie) as T;
        } catch {
            return cookie as T;
        }
    } catch (error) {
        console.error(`Error getting cookie ${key}:`, error);
        return null;
    }
};

export const setCookie = <T>(key: string, value: T, options?: Cookies.CookieAttributes) => {
    try {
        const cookieValue = typeof value === "string" ? value : JSON.stringify(value);
        Cookies.set(key, cookieValue, {
            expires: COOKIES_EXPIRE_TIME,
            ...options,
        });
        return true;
    } catch (error) {
        console.error(`Error setting cookie ${key}:`, error);
        return false;
    }
};

export const removeCookie = (key: string, options?: Cookies.CookieAttributes) => {
    try {
        Cookies.remove(key, options);
        return true;
    } catch (error) {
        console.error(`Error removing cookie ${key}:`, error);
        return false;
    }
};

export const clearAllCookies = () => {
    try {
        Object.values(COOKIES_KEYS).forEach((key) => {
            Cookies.remove(key);
        });
        return true;
    } catch (error) {
        console.error("Error clearing all cookies:", error);
        return false;
    }
};
