import { COLOR_BY_TYPE } from "@/models/constant/daily";
import { DailyScheduleType } from "@/models/types/dailySchedule";

// NOT IN USE
export const sortAndGroupScheduleData = (scheduleData: DailyScheduleType[]) => {
    const order = { missingTeacher: 0, existingTeacher: 1, event: 2 } as const;
    const sorted = [...scheduleData].sort(
        (a, b) => order[a.issueTeacherType] - order[b.issueTeacherType],
    );
    const grouped: Record<string, Record<number, DailyScheduleType>> = {};
    for (const item of sorted) {
        if (!grouped[item.columnId]) grouped[item.columnId] = {};
        grouped[item.columnId][item.hour] = item;
    }
    return grouped;
};
// NOT IN USE
export const getHeaderItems = (
    scheduleByColumn: Record<string, Record<number, DailyScheduleType>>,
) => {
    const columnIds = Object.keys(scheduleByColumn);
    return columnIds.map((columnId) => {
        const firstItem = Object.values(scheduleByColumn[columnId])[0];
        const title = firstItem?.eventTitle || firstItem?.issueTeacher?.name || "";
        const color = firstItem?.issueTeacherType
            ? COLOR_BY_TYPE[firstItem.issueTeacherType as keyof typeof COLOR_BY_TYPE]
            : undefined;
        const type = firstItem?.issueTeacherType;
        const teacherId = firstItem?.issueTeacher?.id;
        return { title, color, type, teacherId };
    });
};
