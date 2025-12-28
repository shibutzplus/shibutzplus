import { deleteDailyCellAction } from "@/app/actions/DELETE/deleteDailyCellAction";
import { addDailyEventCellAction } from "@/app/actions/POST/addDailyEventCellAction";
import { updateDailyEventCellAction } from "@/app/actions/PUT/updateDailyEventCellAction";
import { updateDailyEventHeaderAction } from "@/app/actions/PUT/updateDailyEventHeaderAction";
import { useMainContext } from "@/context/MainContext";
import { DAILY_SCHOOL_DATA_CHANGED } from "@/models/constant/sync";
import { eventPlaceholder } from "@/models/constant/table";
import { ColumnTypeValues, DailySchedule, DailyScheduleCell } from "@/models/types/dailySchedule";
import { TeacherType } from "@/models/types/teachers";
import { addNewEventCell } from "@/services/daily/add";
import { fillLeftRowsWithEmptyCells, initDailySchedule } from "@/services/daily/populate";
import { updateAddCell, updateAllEventHeader, updateDeleteCell } from "@/services/daily/update";
import { pushSyncUpdate } from "@/services/syncService";
import { getDayNumberByDateString } from "@/utils/time";

const useDailyEventActions = (
    mainDailyTable: DailySchedule,
    setMainAndStorageTable: (newSchedule: DailySchedule) => void,
    clearColumn: (day: string, columnId: string) => void,
    selectedDate: string,
) => {
    const { school } = useMainContext();

    const pushIfPublished = () => {
        if (!!school?.publishDates?.includes(selectedDate)) pushSyncUpdate(DAILY_SCHOOL_DATA_CHANGED);
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
                const dayNum = getDayNumberByDateString(selectedDate).toString();

                const response = await addDailyEventCellAction({
                    date: new Date(selectedDate),
                    day: dayNum,
                    hour: 0,
                    columnId,
                    school: school,
                    issueTeacherType: ColumnTypeValues.event,
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
        });
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
                pushIfPublished();
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
                pushIfPublished();
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
            pushIfPublished();
            return true;
        }
    };

    return {
        populateEventColumn,
        addEventCell,
        updateEventCell,
        deleteEventCell,
    };
};

export default useDailyEventActions;
