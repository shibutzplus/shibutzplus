import { SelectOption } from "@/models/types";
import { DailyScheduleType } from "@/models/types/dailySchedule";
import { PortalSchedule } from "@/models/types/portalSchedule";
import {
    getDateReturnString,
    getTodayDateString,
    getTomorrowDateString,
    israelTimezoneDate,
} from "@/utils/time";

export const selectSelectedDate = (dates: SelectOption[]) => {
    const israelTime = israelTimezoneDate();
    const currentHour = israelTime.getHours();

    const todayDate = getTodayDateString();
    const tomorrowDate = getTomorrowDateString();

    // If current time is before 16:00, try to find today first
    if (currentHour < 16) {
        const todayOption = dates.find((date) => date.value === todayDate);
        if (todayOption) {
            return todayOption;
        }

        // If today is not found, try tomorrow
        const tomorrowOption = dates.find((date) => date.value === tomorrowDate);
        if (tomorrowOption) {
            return tomorrowOption;
        }
    } else {
        // If current time is 16:00 or after, try to find tomorrow first
        const tomorrowOption = dates.find((date) => date.value === tomorrowDate);
        if (tomorrowOption) {
            return tomorrowOption;
        }
    }

    // If neither today nor tomorrow is found, return the first option
    return dates[0];
};

export const populatePortalTable = (
    dataColumns: DailyScheduleType[],
    mainPortalTable: PortalSchedule,
    selectedDate: string,
) => {
    if (!selectedDate) return;

    const next: PortalSchedule = { ...mainPortalTable };

    next[selectedDate] = {};

    if (Array.isArray(dataColumns) && dataColumns.length > 0) {
        for (const entry of dataColumns) {
            const date = getDateReturnString(entry.date);
            if (date !== selectedDate) continue;

            const hour = String(entry.hour);
            next[selectedDate]![hour] = {
                DBid: entry.id,
                columnId: entry.columnId,
                hour: entry.hour,
                schoolId: entry.school?.id,
                school: entry.school,
                classes: entry.classes,
                subject: entry.subject,
                subTeacher: entry.subTeacher,
                issueTeacher: entry.issueTeacher,
                event: entry.event,
                instructions: entry.instructions,
            };
        }
    }

    return next;
};
