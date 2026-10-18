import { eventPlaceholder } from "@/models/constant/table";
import { ColumnTypeValues, DailySchedule, DailyScheduleCell } from "@/models/types/dailySchedule";
import { TeacherType } from "@/models/types/teachers";

/**
 * Internal helper to clone the schedule down to cell level.
 */
const cloneScheduleToCell = (
    mainDailyTable: DailySchedule,
    selectedDate: string,
    columnId: string,
    cellData: DailyScheduleCell,
) => {
    const updatedSchedule: DailySchedule = {
        ...mainDailyTable,
        [selectedDate]: {
            ...(mainDailyTable[selectedDate] || {}),
            [columnId]: {
                ...(mainDailyTable[selectedDate]?.[columnId] || {}),
            },
        },
    };

    const hourStr = cellData.hour.toString();
    const existingCell: DailyScheduleCell = {
        ...(updatedSchedule[selectedDate][columnId][hourStr] || cellData),
    };

    return { updatedSchedule, existingCell, hourStr };
};

/**
 * Updates daily schedule state for a teacher cell (substitution or text note).
 */
export const updateAddTeacherCell = (
    responseId: string,
    mainDailyTable: DailySchedule,
    selectedDate: string,
    cellData: DailyScheduleCell,
    columnId: string,
    data: { subTeacher?: TeacherType; event?: string },
) => {
    const { updatedSchedule, existingCell, hourStr } = cloneScheduleToCell(
        mainDailyTable,
        selectedDate,
        columnId,
        cellData,
    );

    existingCell.DBid = responseId;

    if (data.event !== undefined) {
        existingCell.event = data.event;
        delete existingCell.subTeacher;
    } else if (data.subTeacher !== undefined) {
        existingCell.subTeacher = data.subTeacher;
        delete existingCell.event;
    } else {
        delete existingCell.subTeacher;
        delete existingCell.event;
    }

    updatedSchedule[selectedDate][columnId][hourStr] = existingCell;
    return updatedSchedule;
};

/**
 * Updates daily schedule state for an event cell.
 */
export const updateAddEventCell = (
    responseId: string,
    mainDailyTable: DailySchedule,
    selectedDate: string,
    cellData: DailyScheduleCell,
    columnId: string,
    data: { event?: string },
    headerEvent?: string,
) => {
    const { updatedSchedule, existingCell, hourStr } = cloneScheduleToCell(
        mainDailyTable,
        selectedDate,
        columnId,
        cellData,
    );

    existingCell.DBid = responseId;
    existingCell.event = data.event !== null && data.event !== undefined ? data.event : eventPlaceholder;

    if (headerEvent) {
        existingCell.headerCol = {
            ...existingCell.headerCol,
            headerEvent,
            type: ColumnTypeValues.event,
        };
    }

    updatedSchedule[selectedDate][columnId][hourStr] = existingCell;
    return updatedSchedule;
};

/**
 * Updates daily schedule state for a guard cell.
 */
export const updateAddGuardCell = (
    responseId: string,
    mainDailyTable: DailySchedule,
    selectedDate: string,
    cellData: DailyScheduleCell,
    columnId: string,
    data: { event?: string; guardTeacherIds?: string[]; instructions?: string | null },
    guardTitle?: string,
) => {
    const { updatedSchedule, existingCell, hourStr } = cloneScheduleToCell(
        mainDailyTable,
        selectedDate,
        columnId,
        cellData,
    );

    existingCell.DBid = responseId;

    if (data.guardTeacherIds !== undefined) {
        existingCell.guardTeacherIds = data.guardTeacherIds;
    }

    if (data.instructions !== undefined) {
        existingCell.instructions = data.instructions !== null ? data.instructions : undefined;
    }

    if (data.event !== undefined) {
        existingCell.event = data.event;
    }

    if (guardTitle) {
        existingCell.headerCol = {
            ...existingCell.headerCol,
            headerEvent: guardTitle,
            type: ColumnTypeValues.guard,
        };
    }

    updatedSchedule[selectedDate][columnId][hourStr] = existingCell;
    return updatedSchedule;
};

export const updateDeleteCell = (
    deletedRowId: string,
    mainDailyTable: DailySchedule,
    selectedDate: string,
    cellData: DailyScheduleCell,
    columnId: string,
) => {
    if (!mainDailyTable[selectedDate] || !mainDailyTable[selectedDate][columnId]) {
        return mainDailyTable;
    }

    const hourStr = cellData.hour.toString();
    const existingCell = mainDailyTable[selectedDate][columnId][hourStr];

    if (existingCell && existingCell.DBid === deletedRowId) {
        const updatedSchedule: DailySchedule = {
            ...mainDailyTable,
            [selectedDate]: {
                ...mainDailyTable[selectedDate],
                [columnId]: {
                    ...mainDailyTable[selectedDate][columnId],
                    [hourStr]: {
                        headerCol: existingCell.headerCol,
                        hour: existingCell.hour,
                    },
                },
            },
        };
        return updatedSchedule;
    }

    return mainDailyTable;
};

/**
 * Updates header title for all cells in an event column.
 */
export const updateAllEventHeader = (
    updatedSchedule: DailySchedule,
    selectedDate: string,
    columnId: string,
    eventTitle: string,
    fromHour: number = 1,
    toHour: number = 10,
) => {
    for (let i = fromHour; i <= toHour; i++) {
        const cell = updatedSchedule[selectedDate]?.[columnId]?.[`${i}`];
        if (cell) {
            cell.headerCol = {
                ...cell.headerCol,
                headerEvent: eventTitle,
                type: ColumnTypeValues.event,
            };
        }
    }
    return updatedSchedule;
};

/**
 * Updates header title for all cells in a guard column.
 */
export const updateAllGuardHeader = (
    updatedSchedule: DailySchedule,
    selectedDate: string,
    columnId: string,
    guardTitle: string,
    fromHour: number = 1,
    toHour: number = 10,
) => {
    for (let i = fromHour; i <= toHour; i++) {
        const cell = updatedSchedule[selectedDate]?.[columnId]?.[`${i}`];
        if (cell) {
            cell.headerCol = {
                ...cell.headerCol,
                headerEvent: guardTitle,
                type: ColumnTypeValues.guard,
            };
        }
    }
    return updatedSchedule;
};
