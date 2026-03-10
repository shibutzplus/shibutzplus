import { z } from "zod";


export const subjectSchema = z.object({
    name: z
        .string()
        .trim()
        .min(2, "מקצוע חייב להכיל לפחות 2 תווים")
        .max(22, "מקצוע לא יכול להכיל יותר מ-22 תווים")
});
