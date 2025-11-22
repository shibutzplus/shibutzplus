import { EventColor, ExistingTeacherColor, MissingTeacherColor } from "@/style/root";

export const EmptyValue = "empty";

export const PublishLimitNumber = 6;

export const DailyTableLimitNumber = 14;

export const COLOR_BY_TYPE = {
    missingTeacher: MissingTeacherColor,
    existingTeacher: ExistingTeacherColor,
    event: EventColor,
} as const;
