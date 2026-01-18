export type SelectOption<T = string> = {
    value: T;
    label: string;
};

export type GroupOption = {
    readonly label: string;
    readonly options: { value: string; label: string }[];
    readonly collapsed?: boolean;
    readonly hideCount?: boolean;
};

export type Pair = [string, string];

export type AppType = "public" | "private";

export type ScreenType =
    | "history"
    | "dailySchedule"
    | "publicSchedule"
    | "statistics"
    | "teacherMaterial";
