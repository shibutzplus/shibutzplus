import { eventPlaceholder } from "@/models/constant/table";
import { ColumnTypeValues, DailySchedule, DailyScheduleCell } from "@/models/types/dailySchedule";
import { TeacherType } from "@/models/types/teachers";
import { HOURS_IN_DAY } from "@/utils/time";

/**
 * Updates the local daily schedule state with a new or modified cell.
 */
export const updateAddCell = (
    responseId: string,
    mainDailyTable: DailySchedule,
    selectedDate: string,
    cellData: DailyScheduleCell,
    columnId: string,
    data: { event?: string; subTeacher?: TeacherType },
) => {
    const hourStr = cellData.hour.toString();
    const existingDate = mainDailyTable[selectedDate] || {};
    const existingColumn = existingDate[columnId] || {};
    const existingCell = existingColumn[hourStr];

    let newCell: DailyScheduleCell;

    if (existingCell) {
        // Initialize scheduleItems if not present
        let scheduleItems = existingCell.scheduleItems ? [...existingCell.scheduleItems] : [];

        // If it was a single class cell without scheduleItems, convert it
        if (!existingCell.scheduleItems && existingCell.class && existingCell.subject) {
            scheduleItems = [{
                class: existingCell.class,
                subject: existingCell.subject,
                DBid: existingCell.DBid
            }];
        }

        // Add the new item to scheduleItems
        if (cellData.class && cellData.subject) {
            const alreadyExists = scheduleItems.some(
                item => item.class.id === cellData.class!.id
            );

            if (!alreadyExists) {
                scheduleItems.push({
                    class: cellData.class,
                    subject: cellData.subject,
                    DBid: responseId
                });
            }
        }

        newCell = {
            ...existingCell,
            scheduleItems
        };

    } else {
        // New cell
        newCell = { ...cellData, DBid: responseId };

        // If it has class data, also init scheduleItems for consistency
        if (newCell.class && newCell.subject) {
            newCell.scheduleItems = [{
                class: newCell.class,
                subject: newCell.subject,
                DBid: responseId
            }];
        }
    }

    // Apply updates (event, subTeacher)
    if (data.event) {
        newCell = {
            ...newCell,
            DBid: responseId,
            event: data.event || eventPlaceholder,
        };
        delete newCell.subTeacher;
    } else if (data.subTeacher) {
        newCell = {
            ...newCell,
            DBid: responseId,
            subTeacher: data.subTeacher,
        };
        delete newCell.event;
    } else if (!data.subTeacher && !data.event && !cellData.class) {
        newCell = {
            ...newCell,
            DBid: responseId,
        };
        delete newCell.subTeacher;
        delete newCell.event;
    }

    return {
        ...mainDailyTable,
        [selectedDate]: {
            ...existingDate,
            [columnId]: {
                ...existingColumn,
                [hourStr]: newCell
            }
        }
    };
};

/**
 * Updates the local daily schedule state by removing a deleted cell's content.
 */
export const updateDeleteCell = (
    deletedRowId: string,
    mainDailyTable: DailySchedule,
    selectedDate: string,
    cellData: DailyScheduleCell,
    columnId: string,
) => {
    const existingDate = mainDailyTable[selectedDate];
    if (!existingDate) return mainDailyTable;

    const existingColumn = existingDate[columnId];
    if (!existingColumn) return mainDailyTable;

    const hourStr = cellData.hour.toString();
    const existingCell = existingColumn[hourStr];

    if (existingCell && existingCell.DBid === deletedRowId) {
        return {
            ...mainDailyTable,
            [selectedDate]: {
                ...existingDate,
                [columnId]: {
                    ...existingColumn,
                    [hourStr]: {
                        headerCol: existingCell.headerCol,
                        hour: existingCell.hour,
                    }
                }
            }
        };
    }

    return mainDailyTable;
};

/**
 * Updates the header information for all cells in a specific event column.
 */
export const updateAllEventHeader = (
    mainSchedule: DailySchedule,
    selectedDate: string,
    columnId: string,
    eventTitle: string,
) => {
    const existingDate = mainSchedule[selectedDate];
    if (!existingDate) return mainSchedule;

    const existingColumn = existingDate[columnId];
    if (!existingColumn) return mainSchedule;

    const newColumn = { ...existingColumn };

    for (let i = 1; i <= HOURS_IN_DAY; i++) {
        const hourStr = `${i}`;
        if (newColumn[hourStr]) {
            newColumn[hourStr] = {
                ...newColumn[hourStr],
                headerCol: {
                    ...newColumn[hourStr].headerCol,
                    headerEvent: eventTitle,
                    type: ColumnTypeValues.event,
                }
            };
        }
    }

    return {
        ...mainSchedule,
        [selectedDate]: {
            ...existingDate,
            [columnId]: newColumn
        }
    };
};
