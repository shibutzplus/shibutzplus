import { z } from "zod";
import { allowedRe, noControlRe } from ".";

export const teacherSchema = z.object({
    name: z
        .string()
        .trim()
        .min(2, "שם חייב להכיל לפחות 2 תווים")
        .max(20, "שם לא יכול להכיל יותר מ-20 תווים")
        .transform((s) => s.replace(/\s+/g, " ")) // collapse inner spaces
        // Only check illegal chars if not empty, so empty/short hits .min message
        .refine((s) => s.length === 0 || !noControlRe.test(s), {
            message: "תווים לא חוקיים",
        })
        .refine((s) => s.length === 0 || allowedRe.test(s), {
            message: "תווים לא חוקיים",
        }),
});
