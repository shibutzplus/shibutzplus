import { DailyScheduleType } from "@/models/types/dailySchedule";
import { COLOR_BY_TYPE } from "@/style/tableColors";

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

export const getHeaderItems = (scheduleByColumn: Record<string, Record<number, DailyScheduleType>>) => {
    const columnIds = Object.keys(scheduleByColumn);
    return columnIds.map((columnId) => {
        const firstItem = Object.values(scheduleByColumn[columnId])[0];
        const title = firstItem?.eventTitle || firstItem?.issueTeacher?.name || "";
        const color = firstItem?.issueTeacherType
            ? COLOR_BY_TYPE[firstItem.issueTeacherType as keyof typeof COLOR_BY_TYPE]
            : undefined;
        return { title, color };
    });
};
