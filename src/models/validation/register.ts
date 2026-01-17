import { z } from "zod";
import { UserRole, UserGender } from "../types/auth";
import { SchoolLevel } from "../types/school";

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
        .custom<UserRole>((val) => ["admin", "principal", "deputy_principal", "teacher", "guest"].includes(val as string), {
            message: "סוג משתמש לא תקין"
        }),
    gender: z
        .custom<UserGender>((val) => ["male", "female"].includes(val as string), {
            message: "מגדר לא תקין"
        }),
    schoolName: z
        .string()
        .min(2, "שם בית ספר חייב להכיל לפחות 2 תווים"),
    city: z
        .string()
        .min(2, "עיר חייבת להכיל לפחות 2 תווים"),
    level: z
        .custom<SchoolLevel>((val) => ["Elementary", "Middle", "High"].includes(val as string), {
            message: "שלב בית ספר לא תקין"
        })
});
