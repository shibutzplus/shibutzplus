import { z } from "zod";

export const dailyInstructionSchema = z.object({
    instructions: z
        .string()
        .trim()
        // Server-side safety limit: higher than the client-side text limit (1500 chars)
        // to accommodate full HTML markup, formatting tags, and link/file URLs.
        .max(4000, "ההנחיות ארוכות מדי")
        .optional()
        .nullable(),
});

