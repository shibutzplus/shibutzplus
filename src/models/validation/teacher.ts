import { z } from "zod";
import { TeacherRoleValues } from "@/models/types/teachers";

export const teacherSchema = z.object({
    name: z
        .string()
        .min(1, "שם מורה נדרש")
        .min(2, "שם מורה חייב להכיל לפחות 2 תווים")
        .max(50, "שם מורה לא יכול להכיל יותר מ-50 תווים"),
    role: z.enum([TeacherRoleValues.REGULAR, TeacherRoleValues.SUBSTITUTE], {
        message: "תפקיד מורה נדרש"
    }),
    schoolId: z
        .string()
        .min(1, "מזהה בית ספר נדרש"),
    userId: z.string().nullable().optional()
});
