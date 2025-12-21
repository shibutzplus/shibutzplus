import { SelectOption } from "@/models/types";
import { ActivityOptions } from "@/models/types/dailySchedule";

export const dailySelectActivity: SelectOption<ActivityOptions>[] = [
    { value: "test", label: "מבחן" },
    { value: "trip", label: "טיול" },
    { value: "show", label: "הצגה" },
    { value: "home", label: "משוחררים הביתה" },
];

export const activityOptionsMapValToLabel = (value: string) => {
    switch (value) {
        case "test":
            return "מבחן";
        case "trip":
            return "טיול";
        case "show":
            return "הצגה";
        case "home":
            return "משוחררים הביתה";
    }
};