import { z } from "zod";


export const subjectSchema = z.object({
    name: z
        .string()
        .trim()
        .min(2, "מקצוע חייב להכיל לפחות 2 תווים")
        .max(20, "מקצוע לא יכול להכיל יותר מ-20 תווים")
});
