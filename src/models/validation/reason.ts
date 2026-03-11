import { z } from "zod";

export const reasonSchema = z
    .string()
    .trim()
    .max(15, "סיבה יכולה להכיל עד 15 תווים")
    .regex(/^[^<>{}]*$/, "תווים לא חוקיים");
