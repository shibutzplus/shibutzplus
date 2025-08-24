import { z } from "zod";

export const classSchema = z.object({
    name: z
        .string()
        .min(1, "שם כיתה נדרש")
        .min(2, "שם כיתה חייב להכיל לפחות 2 תווים")
        .max(20, "שם כיתה לא יכול להכיל יותר מ-20 תווים")
});
