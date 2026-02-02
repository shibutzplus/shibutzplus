import { z } from "zod";
import { UserRole, UserGender } from "../types/auth";
import { SchoolLevel } from "../types/school";
import { USER_ROLES, USER_GENDER } from "../constant/auth";
import { SCHOOL_LEVEL } from "../constant/school";

export const registerSchema = z.object({
    password: z
        .string()
        .min(2, "סיסמה חייבת להכיל לפחות 2 תווים"),
    name: z
        .string()
        .min(2, "שם מלא חייב להכיל לפחות 2 תווים"),
    email: z
        .string()
        .email("כתובת אימייל לא תקינה"),
    role: z
        .custom<UserRole>((val) => Object.values(USER_ROLES).includes(val as any), {
            message: "סוג משתמש לא תקין"
        }),
    gender: z
        .custom<UserGender>((val) => Object.values(USER_GENDER).includes(val as any), {
            message: "מגדר לא תקין"
        }),
    schoolName: z
        .string()
        .min(2, "שם בית ספר חייב להכיל לפחות 2 תווים"),
    city: z
        .string()
        .min(2, "עיר חייבת להכיל לפחות 2 תווים"),
    level: z
        .custom<SchoolLevel>((val) => Object.values(SCHOOL_LEVEL).includes(val as any), {
            message: "שלב בית ספר לא תקין"
        })
});
