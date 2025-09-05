import { z } from "zod";
import { allowedRe, noControlRe } from ".";

export const teacherSchema = z.object({
    name: z
        .string()
        .trim()
        .min(2, "שם מורה חייב להכיל לפחות 2 תווים")
        .max(50, "שם מורה לא יכול להכיל יותר מ-50 תווים")
        .transform((s) => s.replace(/\s+/g, " "))
        .refine((s) => !noControlRe.test(s), "תווים לא חוקיים")
        .refine((s) => allowedRe.test(s), "תווים לא חוקיים"),
});
