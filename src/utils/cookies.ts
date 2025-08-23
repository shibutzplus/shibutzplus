import Cookies from "js-cookie";
import { COOKIES_KEYS } from "@/resources/storage";
import { COOKIES_EXPIRE_TIME } from "@/utils/time";

export const getTeacherCookie = () => {
    try {
        return Cookies.get(COOKIES_KEYS.REMEMBERED_TEACHER) as string | undefined;
    } catch (error) {
        console.error("Error getting teacher cookie:", error);
        return undefined;
    }
};

export const setTeacherCookie = (teacherId: string) => {
    try {
        Cookies.set(COOKIES_KEYS.REMEMBERED_TEACHER, teacherId, {
            expires: COOKIES_EXPIRE_TIME,
        });
    } catch (error) {
        console.error("Error setting teacher cookie:", error);
    }
};
