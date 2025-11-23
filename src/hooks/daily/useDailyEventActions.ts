import { deleteDailyCellAction } from "@/app/actions/DELETE/deleteDailyCellAction";
import { addDailyEventCellAction } from "@/app/actions/POST/addDailyEventCellAction";
import { updateDailyEventCellAction } from "@/app/actions/PUT/updateDailyEventCellAction";
import { updateDailyEventHeaderAction } from "@/app/actions/PUT/updateDailyEventHeaderAction";
import { useMainContext } from "@/context/MainContext";
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
        if (!!school?.publishDates?.includes(selectedDate)) pushSyncUpdate("event");
    };

    const populateEventColumn = async (columnId: string, eventTitle: string) => {
        const alreadyExists = mainDailyTable[selectedDate]?.[columnId];
        let updatedSchedule: DailySchedule = { ...mainDailyTable };

        if (alreadyExists && alreadyExists["1"]?.headerCol?.headerEvent === eventTitle) {
            const response = await updateDailyEventHeaderAction(selectedDate, columnId, eventTitle);
            if (response.success) {
                updatedSchedule = updateAllEventHeader(
                    updatedSchedule,
                    selectedDate,
                    columnId,
                    eventTitle,
                );
            } else {
                console.error("Failed to update daily event cell:", response.message);
                return;
            }
        } else {
            clearColumn(selectedDate, columnId);
            updatedSchedule = initDailySchedule(updatedSchedule, selectedDate, columnId);
            // Create a new entry in DB
            if (school?.id) {
                const dayNum = getDayNumberByDateString(selectedDate).toString();
                await addDailyEventCellAction({
                    date: new Date(selectedDate),
                    day: dayNum,
                    hour: 0,
                    columnId,
                    school: school,
                    issueTeacherType: ColumnTypeValues.event,
                    eventTitle,
                    event: eventPlaceholder,
                    position: 0,
                });
            }
        }

        updatedSchedule = fillLeftRowsWithEmptyCells(updatedSchedule, selectedDate, columnId, {
            headerEvent: eventTitle,
            type: ColumnTypeValues.event,
        });
        setMainAndStorageTable(updatedSchedule);
    };

    const addEventCell = async (
        cellData: DailyScheduleCell,
        columnId: string,
        data: { event?: string; subTeacher?: TeacherType },
    ) => {
        if (!school) return;
        const eventTitle = data.event || eventPlaceholder;
        const dailyCellData = addNewEventCell(school, cellData, columnId, selectedDate, eventTitle);
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
        const dailyCellData = addNewEventCell(school, cellData, columnId, selectedDate, event);
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
