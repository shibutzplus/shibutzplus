import { z } from "zod";
import { allowedRe, noControlRe } from ".";

export const classSchema = z.object({
    name: z
        .string()
        .trim()
        .min(2, "כיתה חייבת להכיל לפחות 2 תווים")
        .max(20, "כיתה לא יכולה להכיל יותר מ-20 תווים")
        .transform((s) => s.replace(/\s+/g, " "))
        .refine((s) => s.length === 0 || !noControlRe.test(s), {
            message: "תווים לא חוקיים",
        })
        .refine((s) => s.length === 0 || allowedRe.test(s), {
            message: "תווים לא חוקיים",
        }),
});

