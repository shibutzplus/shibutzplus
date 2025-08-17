import { z } from "zod";

export const subjectSchema = z.object({
    name: z
        .string()
        .min(1, "שם מקצוע נדרש")
        .min(2, "שם מקצוע חייב להכיל לפחות 2 תווים")
        .max(50, "שם מקצוע לא יכול להכיל יותר מ-50 תווים"),
    schoolId: z
        .string()
        .min(1, "מזהה בית ספר נדרש")
});
