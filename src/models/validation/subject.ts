import { z } from "zod";
import { allowedRe, noControlRe } from ".";

export const subjectSchema = z.object({
    name: z
        .string()
        .trim()
        .min(2, "שם המקצוע חייב להכיל לפחות 2 תווים")
        .max(50, "שם המקצוע לא יכול להכיל יותר מ-50 תווים")
        .transform((s) => s.replace(/\s+/g, " ")) // איחוד רווחים
        .refine((s) => !noControlRe.test(s), "תווים לא חוקיים")
        .refine((s) => allowedRe.test(s), "תווים לא חוקיים"),
});
