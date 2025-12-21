import { SelectOption } from "@/models/types";
import { DailyScheduleType } from "@/models/types/dailySchedule";
import { PortalSchedule } from "@/models/types/portalSchedule";
import { ClassType } from "@/models/types/classes";
import { SubjectType } from "@/models/types/subjects";
import { getDateReturnString, getTodayDateString, getTomorrowDateString, israelTimezoneDate, AUTO_SWITCH_TIME, } from "@/utils/time";

export const selectSelectedDate = (dates: SelectOption[]) => {
    const israelTime = israelTimezoneDate();
    const currentHour = israelTime.getHours();

    const todayDate = getTodayDateString();
    const tomorrowDate = getTomorrowDateString();

    const [switchHour] = AUTO_SWITCH_TIME.split(":").map(Number);

    // If current time is before AUTO_SWITCH_TIME, try to find today first
    if (currentHour < switchHour) {
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
        // If current time is AUTO_SWITCH_TIME or after, try to find tomorrow first
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
        // Group entries by hour to handle duplicates
        const entriesByHour = new Map<string, DailyScheduleType[]>();

        for (const entry of dataColumns) {
            const date = getDateReturnString(entry.date);
            if (date !== selectedDate) continue;

            const hour = String(entry.hour);
            const existing = entriesByHour.get(hour) || [];
            existing.push(entry);
            entriesByHour.set(hour, existing);
        }

        // Iterate over grouped entries and populate
        entriesByHour.forEach((entries, hour) => {
            if (entries.length > 0) {
                const firstEntry = entries[0];

                // Deduplicate and create scheduleItems
                const uniqueClasses = new Set();
                const scheduleItems: { class: ClassType; subject: SubjectType; DBid?: string | undefined; }[] = [];

                entries.forEach((item) => {
                    if (item.class && item.subject) {
                        if (!uniqueClasses.has(item.class.id)) {
                            uniqueClasses.add(item.class.id);
                            scheduleItems.push({
                                class: item.class,
                                subject: item.subject,
                                DBid: item.id,
                            });
                        }
                    }
                });

                next[selectedDate]![hour] = {
                    DBid: firstEntry.id,
                    columnId: firstEntry.columnId,
                    hour: firstEntry.hour,
                    schoolId: firstEntry.school?.id,
                    school: firstEntry.school,
                    class: firstEntry.class,
                    subject: firstEntry.subject,
                    subTeacher: firstEntry.subTeacher,
                    issueTeacher: firstEntry.issueTeacher,
                    event: firstEntry.event,
                    instructions: firstEntry.instructions,
                    scheduleItems: scheduleItems.length > 0 ? scheduleItems : undefined,
                };
            }
        });
    }

    return next;
};
