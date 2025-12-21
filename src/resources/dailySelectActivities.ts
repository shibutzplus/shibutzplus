import { SelectOption } from "@/models/types";
import { ActivityOptions } from "@/models/types/dailySchedule";

export const dailySelectActivity: SelectOption<ActivityOptions>[] = [
    { value: "home", label: "משוחררים הביתה" },
    { value: "test", label: "מבחן" },
    { value: "trip", label: "טיול" },
    { value: "show", label: "הצגה" },
];

export const activityOptionsMapValToLabel = (value: string) => {
    switch (value) {
        case "home":
            return "משוחררים הביתה";
        case "test":
            return "מבחן";
        case "trip":
            return "טיול";
        case "show":
            return "הצגה";
    }
};