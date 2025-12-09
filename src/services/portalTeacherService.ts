import { SelectOption } from "@/models/types";
import { getTodayDateString, getTomorrowDateString, israelTimezoneDate } from "@/utils/time";

export const selectSelectedDate = (dates: SelectOption[]) => {
    const israelTime = israelTimezoneDate();
    const currentHour = israelTime.getHours();
    
    const todayDate = getTodayDateString();
    const tomorrowDate = getTomorrowDateString();

    // If current time is before 16:00, try to find today first
    if (currentHour < 16) {
        const todayOption = dates.find(date => date.value === todayDate);
        if (todayOption) {
            return todayOption;
        }
        
        // If today is not found, try tomorrow
        const tomorrowOption = dates.find(date => date.value === tomorrowDate);
        if (tomorrowOption) {
            return tomorrowOption;
        }
    } else {
        // If current time is 16:00 or after, try to find tomorrow first
        const tomorrowOption = dates.find(date => date.value === tomorrowDate);
        if (tomorrowOption) {
            return tomorrowOption;
        }
    }

    // If neither today nor tomorrow is found, return the first option
    return dates[0];
}