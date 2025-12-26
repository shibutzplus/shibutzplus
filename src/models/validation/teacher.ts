import { z } from "zod";


export const teacherSchema = z.object({
    name: z
        .string()
        .trim()
        .min(2, "שם חייב להכיל לפחות 2 תווים")
        .max(20, "שם לא יכול להכיל יותר מ-20 תווים")
});
