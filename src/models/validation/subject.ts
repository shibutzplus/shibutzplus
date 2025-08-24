import { z } from "zod";

export const subjectSchema = z.object({
    name: z
        .string()
        .min(1, "שם המקצוע נדרש")
        .min(2, "שם המקצוע חייב להכיל לפחות 2 תווים")
        .max(50, "שם המקצוע לא יכול להכיל יותר מ-50 תווים")
});
