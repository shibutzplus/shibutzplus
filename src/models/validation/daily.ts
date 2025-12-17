import { z } from "zod";
import { sanitizeHtml } from "@/utils/sanitize";

export const dailyInstructionSchema = z.object({
    instructions: z
        .string()
        .trim()
        .max(1000, "ההנחיות ארוכות מדי (מקסימום 1000 תווים)")
        .transform((val) => sanitizeHtml(val))
        .optional()
        .nullable(),
});
