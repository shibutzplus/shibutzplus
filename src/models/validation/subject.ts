import { z } from "zod";
import { allowedRe, noControlRe } from ".";

export const subjectSchema = z.object({
    name: z
        .string()
        .trim()
        .min(2, "מקצוע חייב להכיל לפחות 2 תווים")
        .max(20, "מקצוע לא יכול להכיל יותר מ-20 תווים")
        .transform((s) => s.replace(/\s+/g, " ")) // איחוד רווחים
        .refine((s) => s.length === 0 || !noControlRe.test(s), {
            message: "תווים לא חוקיים",
        })
        .refine((s) => s.length === 0 || allowedRe.test(s), {
            message: "תווים לא חוקיים",
        }),
});
