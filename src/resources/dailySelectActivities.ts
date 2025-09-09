import { SelectOption } from "@/models/types";
import { ActivityOptions } from "@/models/types/dailySchedule";

export const dailySelectActivity: SelectOption<ActivityOptions>[] = [
    { value: "missing", label: "מורה חסר" },
    { value: "test", label: "מבחן" },
    { value: "trip", label: "טיול" },
    { value: "show", label: "הצגה" },
    { value: "returns", label: "חזרות" },
    { value: "home", label: "משוחררים הביתה" },
];

export const activityOptionsMapValToLabel = (value: string) => {
    switch (value) {
        case "missing":
            return "מורה חסר";
        case "test":
            return "מבחן";
        case "trip":
            return "טיול";
        case "show":
            return "הצגה";
        case "returns":
            return "חזרות";
        case "home":
            return "משוחררים הביתה";
    }
};