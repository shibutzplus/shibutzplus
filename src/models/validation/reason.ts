import { z } from "zod";

export const reasonSchema = z
    .string()
    .trim()
    .max(20, "סיבה יכולה להכיל עד 20 תווים")
    .regex(/^[^<>{}]*$/, "תווים לא חוקיים");
