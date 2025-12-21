import { useState } from "react";
import { getIsraeliDateOptions, getTomorrowOption } from "@/resources/dayOptions";

const useDailySelectedDate = () => {
    const daysSelectOptions = () => getIsraeliDateOptions();

    // Pick today if before 16:00, otherwise tomorrow; skip to tomorrow if today not in options (weekend/holiday)
    const [selectedDate, setSelectedDayId] = useState<string>(() => {
        const now = new Date();
        const hour = now.getHours();
        const opts = getIsraeliDateOptions();
        const pad = (n: number) => String(n).padStart(2, "0"); // comment: local YYYY-MM-DD
        const todayStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;

        const todayInOpts = opts.find((o) => o.value === todayStr)?.value;
        const tomorrow = getTomorrowOption();

        if (hour < 16) {
            return todayInOpts || tomorrow || opts[0]?.value || todayStr;
        }
        return tomorrow || todayInOpts || opts[0]?.value || todayStr;
    });

    // Handle manual day change from dropdown
    const handleDayChange = (value: string) => setSelectedDayId(value);

    return { daysSelectOptions, selectedDate, handleDayChange };
};

export default useDailySelectedDate;
