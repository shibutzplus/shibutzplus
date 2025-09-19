import { z } from "zod";
import { allowedRe, noControlRe } from ".";

export const subjectSchema = z.object({
    name: z
        .string()
        .trim()
        .min(2, "שם המקצוע חייב להכיל לפחות 2 תווים")
        .max(50, "שם המקצוע לא יכול להכיל יותר מ-50 תווים")
        .transform((s) => s.replace(/\s+/g, " ")) // איחוד רווחים
        .refine((s) => s.length === 0 || !noControlRe.test(s), {
            message: "תווים לא חוקיים",
        })
        .refine((s) => s.length === 0 || allowedRe.test(s), {
            message: "תווים לא חוקיים",
        }),
});
