import { z } from "zod";
import { noControlRe } from ".";

export const classSchema = z.object({
    name: z
        .string()
        .trim()
        .min(2, "כיתה חייבת להכיל לפחות 2 תווים")
        .max(20, "כיתה לא יכולה להכיל יותר מ-20 תווים")
});
