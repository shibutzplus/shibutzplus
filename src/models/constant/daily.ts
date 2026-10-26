import { EventColor, ExistingTeacherColor, GuardColor, MissingTeacherColor } from "@/style/root";

export const EmptyValue = "empty";

export const DailyTableLimitNumber = 14;

export const COLOR_BY_TYPE = {
    0: MissingTeacherColor,
    1: ExistingTeacherColor,
    2: EventColor,
    3: GuardColor,
} as const;

export const DEFAULT_EVENT_TITLE = "אירוע";
export const DEFAULT_GUARD_TITLE = "תורנויות";

