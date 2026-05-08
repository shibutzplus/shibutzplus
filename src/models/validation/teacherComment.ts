import { z } from "zod";

export const teacherCommentSchema = z
    .string()
    .max(150, "הערה לא יכולה להכיל יותר מ-150 תווים");
