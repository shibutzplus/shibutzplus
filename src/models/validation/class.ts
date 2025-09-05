import { z } from "zod"

const allowedRe = /^[\p{L}\p{N} _'\-().]+$/u
const noControlRe = /[\u0000-\u001F\u007F]/

export const classSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "שם כיתה חייב להכיל לפחות 2 תווים")
    .max(20, "שם כיתה לא יכול להכיל יותר מ-20 תווים")
    .transform(s => s.replace(/\s+/g, " "))
    .refine(s => !noControlRe.test(s), "תווים לא חוקיים")
    .refine(s => allowedRe.test(s), "תווים לא חוקיים"),
})
