import { z } from "zod";

export const dailyInstructionSchema = z.object({
    instructions: z
        .string()
        .trim()
        .max(1500, "ההנחיות ארוכות מדי (מקסימום 1500 תווים)")
        .optional()
        .nullable(),
});
