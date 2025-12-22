import { z } from "zod";

export const dailyInstructionSchema = z.object({
    instructions: z
        .string()
        .trim()
        .max(1000, "ההנחיות ארוכות מדי (מקסימום 1000 תווים)")
        .optional()
        .nullable(),
});
