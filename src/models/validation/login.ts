import { z } from "zod";

export const loginSchema = z.object({
    email: z
        .string()
        .min(1, "כתובת אימייל נדרשת")
        .email("כתובת אימייל לא תקינה"),
    password: z
        .string()
        .min(1, "סיסמה נדרשת")
        .min(2, "סיסמה חייבת להכיל לפחות 2 תווים"),
    remember: z.boolean().optional()
});