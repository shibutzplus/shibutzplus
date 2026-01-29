import { deleteDailyCellAction } from "@/app/actions/DELETE/deleteDailyCellAction";
import { deleteDailyColumnAction } from "@/app/actions/DELETE/deleteDailyColumnAction";
import { addDailyEventCellAction } from "@/app/actions/POST/addDailyEventCellAction";
import { updateDailyEventCellAction } from "@/app/actions/PUT/updateDailyEventCellAction";
import { updateDailyEventHeaderAction } from "@/app/actions/PUT/updateDailyEventHeaderAction";
import { useMainContext } from "@/context/MainContext";
import { DAILY_SCHEDULE_DATA_CHANGED } from "@/models/constant/sync";
import { eventPlaceholder } from "@/models/constant/table";
import { ColumnTypeValues, DailySchedule, DailyScheduleCell } from "@/models/types/dailySchedule";
import { TeacherType } from "@/models/types/teachers";
import { addNewEventCell } from "@/services/daily/add";
import { fillLeftRowsWithEmptyCells, initDailySchedule } from "@/services/daily/populate";
import { updateAddCell, updateAllEventHeader, updateDeleteCell } from "@/services/daily/update";

import { getDayNumberByDateString } from "@/utils/time";

const useDailyEventActions = (
    mainDailyTable: DailySchedule,
    setMainAndStorageTable: (newSchedule: DailySchedule) => void,
    clearColumn: (day: string, columnId: string) => void,
    selectedDate: string,
    handlePushUpdate: (channel: typeof DAILY_SCHEDULE_DATA_CHANGED) => void
) => {
    const { school, settings } = useMainContext();

    const pushDailyUpdate = () => {
        handlePushUpdate(DAILY_SCHEDULE_DATA_CHANGED);
    };

    const populateEventColumn = async (columnId: string, eventTitle: string) => {
        const alreadyExists = mainDailyTable[selectedDate]?.[columnId];
        const currentPosition = alreadyExists?.["1"]?.headerCol?.position || 0;

        let updatedSchedule: DailySchedule = { ...mainDailyTable };
        let isUpdateSuccess = false;

        // Check if DB records exist for this column
        const hasSavedData = alreadyExists ? Object.values(alreadyExists).some(cell => !!cell.DBid) : false;

        // Try to update existing column first ONLY if we know it exists in DB
        if (hasSavedData && alreadyExists && alreadyExists["1"]?.headerCol?.type === ColumnTypeValues.event) {
            const response = await updateDailyEventHeaderAction(selectedDate, columnId, eventTitle);
            if (response.success) {
                updatedSchedule = updateAllEventHeader(
                    updatedSchedule,
                    selectedDate,
                    columnId,
                    eventTitle,
                );
                isUpdateSuccess = true;
            } else {
                // If update failed (e.g. not found in DB), we will fall through to create
                console.warn("Update failed, attempting to create new column", response.message);
            }
        }

        // If update was skipped or failed, treat as new column creation
        if (!isUpdateSuccess) {
            // Explicitly clear local copy so fillLeftRowsWithEmptyCells regenerates the cells with new header
            if (updatedSchedule[selectedDate]) {
                updatedSchedule[selectedDate] = { ...updatedSchedule[selectedDate] };
                updatedSchedule[selectedDate][columnId] = {};
            }

            updatedSchedule = initDailySchedule(updatedSchedule, selectedDate, columnId);
            // Create a new entry in DB
            if (school?.id) {
                const day = getDayNumberByDateString(selectedDate);
                const response = await addDailyEventCellAction({
                    date: new Date(selectedDate),
                    day: day,
                    hour: 0,
                    columnId,
                    school: school,
                    columnType: ColumnTypeValues.event,
                    eventTitle,
                    event: eventPlaceholder,
                    position: currentPosition,
                });

                if (response.success && response.data?.id) {
                    updatedSchedule[selectedDate][columnId]["0"] = {
                        hour: 0,
                        DBid: response.data.id,
                        headerCol: {
                            headerEvent: eventTitle,
                            type: ColumnTypeValues.event,
                            position: currentPosition,
                        },
                    };
                }
            }
        }

        updatedSchedule = fillLeftRowsWithEmptyCells(updatedSchedule, selectedDate, columnId, {
            headerEvent: eventTitle,
            type: ColumnTypeValues.event,
            position: currentPosition,
        }, settings?.hoursNum);
        setMainAndStorageTable(updatedSchedule);
    };

    const addEventCell = async (
        cellData: DailyScheduleCell,
        columnId: string,
        data: { event?: string; subTeacher?: TeacherType },
    ) => {
        if (!school) return;
        const currentPosition = mainDailyTable[selectedDate]?.[columnId]?.["1"]?.headerCol?.position || 0;
        const eventTitle = data.event || eventPlaceholder;
        const dailyCellData = addNewEventCell(school, cellData, columnId, selectedDate, eventTitle, currentPosition);
        if (dailyCellData) {
            const response = await addDailyEventCellAction(dailyCellData);
            if (response?.success && response.data) {
                const updatedSchedule = updateAddCell(
                    response.data.id,
                    mainDailyTable,
                    selectedDate,
                    cellData,
                    columnId,
                    data,
                    cellData.headerCol?.headerEvent, // Pass the header event from the (potentially patched) cellData
                );
                setMainAndStorageTable(updatedSchedule);
                pushDailyUpdate();
                return response.data;
            }
        }
    };

    const updateEventCell = async (
        cellData: DailyScheduleCell,
        columnId: string,
        dailyScheduleId: string,
        event?: string,
    ) => {
        if (!school || event === undefined) return;
        const currentPosition = mainDailyTable[selectedDate]?.[columnId]?.["1"]?.headerCol?.position || 0;
        const dailyCellData = addNewEventCell(school, cellData, columnId, selectedDate, event, currentPosition);
        if (dailyCellData) {
            const response = await updateDailyEventCellAction(dailyScheduleId, dailyCellData);
            if (response?.success && response.data) {
                const updatedSchedule = updateAddCell(
                    response.data.id,
                    mainDailyTable,
                    selectedDate,
                    cellData,
                    columnId,
                    { event },
                );
                setMainAndStorageTable(updatedSchedule);
                pushDailyUpdate();
                return response.data;
            }
        }
        return undefined;
    };

    const deleteEventCell = async (
        cellData: DailyScheduleCell,
        columnId: string,
        dailyScheduleId: string,
    ) => {
        if (!school) return;
        const response = await deleteDailyCellAction(school.id, dailyScheduleId);
        if (response?.success && response.deletedRowId) {
            const updatedSchedule = updateDeleteCell(
                response.deletedRowId,
                mainDailyTable,
                selectedDate,
                cellData,
                columnId,
            );
            setMainAndStorageTable(updatedSchedule);
            pushDailyUpdate();
            return true;
        }
    };

    const pasteEventColumn = async (
        columnId: string,
        pastedColumnData: { [hour: string]: DailyScheduleCell },
    ) => {
        const schoolId = school?.id;
        if (!schoolId) return false;

        const currentPosition = mainDailyTable[selectedDate]?.[columnId]?.["1"]?.headerCol?.position || 0;
        const eventTitle = pastedColumnData["1"]?.headerCol?.headerEvent || eventPlaceholder;

        try {
            // 1. Clear existing data in DB
            const colData = mainDailyTable[selectedDate]?.[columnId];
            const hasSavedData = colData ? Object.values(colData).some(cell => !!cell.DBid) : false;

            if (hasSavedData) {
                await deleteDailyColumnAction(schoolId, columnId, selectedDate);
            }

            let updatedSchedule: DailySchedule = { ...mainDailyTable };
            if (updatedSchedule[selectedDate]) {
                updatedSchedule[selectedDate] = { ...updatedSchedule[selectedDate] };
                updatedSchedule[selectedDate][columnId] = {};
            }

            const day = getDayNumberByDateString(selectedDate);

            // Paste header row 0
            const headerResponse = await addDailyEventCellAction({
                date: new Date(selectedDate),
                day: day,
                hour: 0,
                columnId,
                school: school,
                columnType: ColumnTypeValues.event,
                eventTitle,
                event: eventPlaceholder,
                position: currentPosition,
            });

            if (headerResponse.success && headerResponse.data?.id) {
                updatedSchedule[selectedDate][columnId]["0"] = {
                    hour: 0,
                    DBid: headerResponse.data.id,
                    headerCol: {
                        headerEvent: eventTitle,
                        type: ColumnTypeValues.event,
                        position: currentPosition,
                    },
                };
                // Immediate feedback: show the cleared column with new header
                updatedSchedule = { ...updatedSchedule };
                setMainAndStorageTable(updatedSchedule);
            }

            // Paste other cells
            for (const hourKey in pastedColumnData) {
                const hour = parseInt(hourKey);
                if (isNaN(hour) || hour === 0) continue;

                const sourceCell = pastedColumnData[hourKey];
                if (sourceCell.event === undefined) continue; // Skip if no event structure

                const dailyCellData = addNewEventCell(school, sourceCell, columnId, selectedDate, sourceCell.event || "", currentPosition);
                if (dailyCellData) {
                    const response = await addDailyEventCellAction(dailyCellData);
                    if (response?.success && response.data) {
                        updatedSchedule = updateAddCell(
                            response.data.id,
                            updatedSchedule,
                            selectedDate,
                            sourceCell,
                            columnId,
                            { event: sourceCell.event },
                            eventTitle
                        );
                    }
                }
            }

            updatedSchedule = fillLeftRowsWithEmptyCells(updatedSchedule, selectedDate, columnId, {
                headerEvent: eventTitle,
                type: ColumnTypeValues.event,
                position: currentPosition,
            }, settings?.hoursNum);
            setMainAndStorageTable(updatedSchedule);
            pushDailyUpdate();
            return true;
        } catch (error) {
            console.error("Error pasting event column:", error);
            return false;
        }
    };

    return {
        populateEventColumn,
        addEventCell,
        updateEventCell,
        deleteEventCell,
        pasteEventColumn,
    };
};

export default useDailyEventActions;

