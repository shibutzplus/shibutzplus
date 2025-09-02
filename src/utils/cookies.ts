import Cookies from "js-cookie"
import { COOKIES_KEYS } from "@/resources/storage"
import { COOKIES_EXPIRE_TIME } from "@/utils/time"

type TeacherCookie = {
    id: string
    name: string
}

export const getTeacherCookie = (): TeacherCookie | undefined => {
    try {
        const raw = Cookies.get(COOKIES_KEYS.REMEMBERED_TEACHER)
        if (!raw) return undefined
        return JSON.parse(raw) as TeacherCookie
    } catch (error) {
        console.error("Error getting teacher cookie:", error)
        return undefined
    }
}

export const setTeacherCookie = (teacherId: string, teacherName: string) => {
    try {
        const value: TeacherCookie = { id: teacherId, name: teacherName }
        Cookies.set(COOKIES_KEYS.REMEMBERED_TEACHER, JSON.stringify(value), {
            expires: COOKIES_EXPIRE_TIME,
        })
    } catch (error) {
        console.error("Error setting teacher cookie:", error)
    }
}
