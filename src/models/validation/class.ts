import { z } from "zod";


export const classSchema = z.object({
    name: z
        .string()
        .trim()
        .min(2, "כיתה חייבת להכיל לפחות 2 תווים")
        .max(22, "כיתה לא יכולה להכיל יותר מ-22 תווים")
});
