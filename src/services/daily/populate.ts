import { AnnualScheduleType, AvailableTeachers } from "@/models/types/annualSchedule";
import {
    ColumnType,
    DailySchedule,
    DailyScheduleCell,
    DailyScheduleType,
    HeaderCol,
} from "@/models/types/dailySchedule";
import { initDailyEventCellData, initDailyTeacherCellData } from "@/services/daily/initialize";
import { HOURS_IN_DAY } from "@/utils/time";
import { setColumn } from "./setColumn";
import { setEmptyColumn } from "./setEmpty";

export const initDailySchedule = (dailySchedule: DailySchedule, date: string, columnId: string) => {
    // Initialize date if it doesn't exist
    if (!dailySchedule[date]) dailySchedule[date] = {};

    // Initialize header if it doesn't exist
    if (!dailySchedule[date][columnId]) dailySchedule[date][columnId] = {};

    return dailySchedule;
};

/**
 * Transforms a flat list of daily schedule columns into a structured, nested object format.
 *
 * This function iterates through the provided `dataColumns`, initializes cell data for each
 * (distinguishing between teacher and event columns), and groups them by the `selectedDate`
 * and `columnId`. The result is a dictionary mapping dates to column IDs to arrays of schedule cells,
 * which facilitates easy merging into the main daily schedule state.
 * @returns A structured record: { [date]: { [columnId]: DailyScheduleCell[] } }
 */
export const populateTable = (dataColumns: DailyScheduleType[], selectedDate: string) => {
    const entriesByDayAndHeader: Record<string, Record<string, DailyScheduleCell[]>> = {};
    const columnsToCreate: { id: string; type: ColumnType }[] = [];
    const seenColumnIds = new Set<string>();

    for (const columnCell of dataColumns) {
        const columnId = columnCell.columnId;

        const { originalTeacher, columnType } = columnCell;

        let cellData: DailyScheduleCell;
        if (originalTeacher) {
            cellData = initDailyTeacherCellData(columnCell);
        } else {
            cellData = initDailyEventCellData(columnCell);
        }
        // If the column is not already in the columnsToCreate array, add it
        if (!seenColumnIds.has(columnId)) {
            columnsToCreate.push({
                id: columnId,
                type: columnType,
            });
            seenColumnIds.add(columnId);
        }

        if (!entriesByDayAndHeader[selectedDate]) {
            entriesByDayAndHeader[selectedDate] = {};
        }
        if (!entriesByDayAndHeader[selectedDate][columnId]) {
            entriesByDayAndHeader[selectedDate][columnId] = [];
        }

        entriesByDayAndHeader[selectedDate][columnId].push(cellData);
    }

    return entriesByDayAndHeader;
};

/**
 * Ensures that all hourly slots in a specific daily schedule column are populated.
 *
 * This function iterates through all hours of the day (1 to HOURS_IN_DAY). If a cell
 * for a specific hour does not exist in the given `columnId` for the `selectedDate`,
 * it creates a new empty cell with the provided `headerCol` information. This ensures
 * the column has a complete set of rows for rendering or processing.
 * @returns The updated daily schedule with all hours filled for the specified column.
 */
export const fillLeftRowsWithEmptyCells = (
    updatedSchedule: DailySchedule,
    selectedDate: string,
    columnId: string,
    headerCol?: HeaderCol | undefined,
    hoursNum: number = HOURS_IN_DAY,
) => {
    for (let hour = 1; hour <= hoursNum; hour++) {
        if (!updatedSchedule[selectedDate][columnId][`${hour}`]) {
            updatedSchedule[selectedDate][columnId][`${hour}`] = { headerCol, hour };
        }
    }
    return updatedSchedule;
};

/**
 * Maps annual schedule data into a structured format of available teachers.
 *
 * This function processes a list of annual schedule entries and organizes them by day and hour.
 * It creates a mapping where each key corresponds to a day, containing an object of hours.
 * Each hour maps to an array of teacher IDs who are scheduled/available at that time.
 * This is used to quickly check teacher availability or assignments for specific time slots.
 * @returns A structured object: { [day]: { [hour]: teacherId[] } }
 */
export const mapAnnualTeachers = (data: AnnualScheduleType[]) => {
    const teacherMapping: AvailableTeachers = {};

    data.forEach((schedule) => {
        const day = schedule.day.toString();
        const hour = schedule.hour.toString();
        const teacherId = schedule.teacher?.id;

        if (!teacherMapping[day]) {
            teacherMapping[day] = {};
        }
        if (!teacherMapping[day][hour]) {
            teacherMapping[day][hour] = [];
        }
        if (teacherId && !teacherMapping[day][hour].includes(teacherId)) {
            teacherMapping[day][hour].push(teacherId);
        }
    });

    return teacherMapping;
};

/**
 * Maps annual schedule data into a structured format of teacher locations (which class they are in).
 *
 * This function processes a list of annual schedule entries and organizes them by day and hour.
 * It creates a mapping where each key corresponds to a day, containing an object of hours.
 * Each hour maps to an object where keys are teacher IDs and values are class IDs.
 * This is used to display where a teacher is teaching when they are unavailable.
 * @returns A structured object: { [day]: { [hour]: { [teacherId]: classId } } }
 */
export const mapAnnualTeacherClasses = (data: AnnualScheduleType[]) => {
    const teacherClassMap: any = {};

    data.forEach((schedule) => {
        const day = schedule.day.toString();
        const hour = schedule.hour.toString();
        const teacherId = schedule.teacher?.id;
        const classId = schedule.class?.id;

        if (!teacherId || !classId) return;

        if (!teacherClassMap[day]) {
            teacherClassMap[day] = {};
        }
        if (!teacherClassMap[day][hour]) {
            teacherClassMap[day][hour] = {};
        }

        teacherClassMap[day][hour][teacherId] = classId;
    });

    return teacherClassMap;
};

/**
 * Populates the main daily schedule table with data for a specific date.
 *
 * This function takes the current `mainDailyTable`, a `selectedDate`, and an array of `dataColumns`
 * (representing the schedule data from the backend). It processes the data to structure it by
 * date and column, and then updates the schedule object. If no data columns are provided,
 * it ensures an empty column structure is initialized for the date.
 * @returns A promise that resolves to the updated `DailySchedule` object, or undefined if an error occurs.
 */
export const populateDailyScheduleTable = async (
    mainDailyTable: DailySchedule,
    selectedDate: string,
    dataColumns: DailyScheduleType[],
    hoursNum: number = HOURS_IN_DAY,
) => {
    try {
        if (!dataColumns) return;
        if (dataColumns.length === 0) {
            return setEmptyColumn(mainDailyTable, selectedDate);
        }

        const entriesByDayAndHeader = populateTable(dataColumns, selectedDate);

        // Populate all schedule data at once
        const newSchedule: DailySchedule = {};
        Object.entries(entriesByDayAndHeader).forEach(([date, headerEntries]) => {
            Object.entries(headerEntries).forEach(([columnId, cells]) => {
                setColumn(cells, newSchedule, columnId, date, hoursNum);
            });
        });

        return newSchedule;
    } catch (error) {
        console.error("Error processing daily schedule data:", error);
    }
};
