import { eventPlaceholder } from "@/models/constant/table";
import { ColumnTypeValues, DailySchedule, DailyScheduleCell } from "@/models/types/dailySchedule";
import { TeacherType } from "@/models/types/teachers";

/**
 * Updates the daily schedule state with a new or modified cell.
 *
 * This function is typically called after a successful database update to reflect changes locally.
 * It locates the specific cell using `selectedDate`, `columnId`, and `cellData.hour`, then updates
 * its content (event text or substitution teacher) and assigns the new database ID (`responseId`).
 * It handles three cases: updating an event, updating a substitution teacher, or clearing both if neither is provided.
 * @returns A new copy of the `DailySchedule` with the updated cell.
 */
export const updateAddCell = (
    responseId: string,
    mainDailyTable: DailySchedule,
    selectedDate: string,
    cellData: DailyScheduleCell,
    columnId: string,
    data: { event?: string; subTeacher?: TeacherType },
    headerEvent?: string,
) => {
    // Deep copy down to the column level
    const updatedSchedule: DailySchedule = {
        ...mainDailyTable,
        [selectedDate]: {
            ...(mainDailyTable[selectedDate] || {}),
            [columnId]: {
                ...(mainDailyTable[selectedDate]?.[columnId] || {}),
            }
        }
    };

    const hourStr = cellData.hour.toString();
    const existingCell = { ...(updatedSchedule[selectedDate][columnId][hourStr] || cellData) };

    if (data.event !== undefined) {
        existingCell.DBid = responseId;
        existingCell.event = data.event !== null && data.event !== undefined ? data.event : eventPlaceholder;
        delete existingCell.subTeacher;
    } else if (data.subTeacher !== undefined) {
        existingCell.DBid = responseId;
        existingCell.subTeacher = data.subTeacher;
        delete existingCell.event;
    } else if (data.subTeacher === undefined && data.event === undefined) {
        existingCell.DBid = responseId;
        delete existingCell.subTeacher;
        delete existingCell.event;
    }

    if (headerEvent) {
        existingCell.headerCol = {
            ...existingCell.headerCol,
            headerEvent: headerEvent,
            type: ColumnTypeValues.event,
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
                    }
                }
            }
        };
        return updatedSchedule;
    }

    return mainDailyTable;
};

/**
 * Updates the header information for all cells in a specific event column.
 *
 * This function iterates through all hours of the day for a given column and updates the
 * `headerCol` property of each cell. It sets the `headerEvent` to the new `eventTitle`
 * and ensures the column type is set to `ColumnTypeValues.event`. This is useful when
 * renaming an event column, ensuring consistency across all time slots.
 * @returns The updated daily schedule with modified headers.
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
        const cell = updatedSchedule[selectedDate][columnId][`${i}`];
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
