import { eventPlaceholder } from "@/models/constant/table";
import { ColumnTypeValues, DailySchedule, DailyScheduleCell } from "@/models/types/dailySchedule";
import { TeacherType } from "@/models/types/teachers";
import { HOURS_IN_DAY } from "@/utils/time";

/**
 * Updates the local daily schedule state with a new or modified cell.
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
    // Update mainDailyTable with the new cell data
    const updatedSchedule = { ...mainDailyTable };
    if (!updatedSchedule[selectedDate]) {
        updatedSchedule[selectedDate] = {};
    }
    if (!updatedSchedule[selectedDate][columnId]) {
        updatedSchedule[selectedDate][columnId] = {};
    }

    const hourStr = cellData.hour.toString();
    const existingCell = updatedSchedule[selectedDate][columnId][hourStr] || {
        ...cellData,
    };

    if (data.event) {
        existingCell.DBid = responseId;
        existingCell.event = data.event || eventPlaceholder;
        delete existingCell.subTeacher;
    } else if (data.subTeacher) {
        existingCell.DBid = responseId;
        existingCell.subTeacher = data.subTeacher;
        delete existingCell.event;
    } else if (!data.subTeacher && !data.event) {
        existingCell.DBid = responseId;
        delete existingCell.subTeacher;
        delete existingCell.event;
    }

    if (headerEvent) {
        existingCell.headerCol = {
            ...existingCell.headerCol,
            headerEvent: headerEvent,
            type: ColumnTypeValues.event, // Ensure type is event
        };
    }

    updatedSchedule[selectedDate][columnId][hourStr] = existingCell;
    return updatedSchedule;
};

/**
 * Updates the local daily schedule state by removing a deleted cell's content.
 *
 * This function is called after a successful deletion in the database. It checks if the
 * cell at the specified location matches the `deletedRowId`. If it does, it resets the cell
 * to its initial state (keeping only `headerCol` and `hour`), effectively removing any
 * event or teacher assignment data.
 * @returns A new copy of the `DailySchedule` with the cell content removed.
 */
export const updateDeleteCell = (
    deletedRowId: string,
    mainDailyTable: DailySchedule,
    selectedDate: string,
    cellData: DailyScheduleCell,
    columnId: string,
) => {
    // Update mainDailyTable by removing the deleted cell data
    const updatedSchedule = { ...mainDailyTable };
    if (!updatedSchedule[selectedDate] || !updatedSchedule[selectedDate][columnId]) {
        return updatedSchedule;
    }

    const hourStr = cellData.hour.toString();
    const existingCell = updatedSchedule[selectedDate][columnId][hourStr];

    if (existingCell && existingCell.DBid === deletedRowId) {
        // Clear the cell data but keep the header structure
        updatedSchedule[selectedDate][columnId][hourStr] = {
            headerCol: existingCell.headerCol,
            hour: existingCell.hour,
        };
    }

    return updatedSchedule;
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
) => {
    for (let i = 1; i <= HOURS_IN_DAY; i++) {
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
