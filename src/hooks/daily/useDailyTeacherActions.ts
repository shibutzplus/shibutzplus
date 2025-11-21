import { deleteDailyColumnAction } from "@/app/actions/DELETE/deleteDailyColumnAction";
import { getTeacherScheduleByDayAction } from "@/app/actions/GET/getTeacherScheduleByDayAction";
import { addDailyTeacherCellAction } from "@/app/actions/POST/addDailyTeacherCellAction";
import { updateDailyTeacherCellAction } from "@/app/actions/PUT/updateDailyTeacherCellAction";
import { useMainContext } from "@/context/MainContext";
import { ColumnType, DailySchedule, DailyScheduleCell } from "@/models/types/dailySchedule";
import { TeacherType } from "@/models/types/teachers";
import {
    addNewTeacherValueCell,
    fillLeftRowsWithEmptyCells,
    setEmptyTeacherColumn,
    updateAddCell,
} from "@/services/dailyScheduleService";
import { pushSyncUpdate } from "@/services/syncService";

const useDailyTeacherActions = (
    mainDailyTable: DailySchedule,
    setMainAndStorageTable: (newSchedule: DailySchedule) => void,
    clearColumn: (day: string, columnId: string) => void,
) => {
    const { school, teachers } = useMainContext();

    const pushIfPublished = (selectedDate: string) => {
        if (!!school?.publishDates?.includes(selectedDate)) pushSyncUpdate("teacher");
    };

    const populateTeacherColumn = async (
        selectedDate: string,
        columnId: string,
        dayNumber: number,
        teacherId: string,
        type: ColumnType,
    ) => {
        const schoolId = school?.id;
        if (!schoolId) return;
        try {
            // Delete the old column record if need to update
            const alreadyExists = mainDailyTable[selectedDate]?.[columnId];
            if (alreadyExists) {
                const response = await deleteDailyColumnAction(school.id, columnId, selectedDate);
                if (!response.success || !response.dailySchedules) {
                    console.error("Failed to delete teacher daily column:", response.message);
                }
            }

            clearColumn(selectedDate, columnId);
            const response = await getTeacherScheduleByDayAction(schoolId, dayNumber, teacherId);
            if (response.success && response.data) {
                if (response.data.length > 0) {
                    let updatedSchedule: DailySchedule = { ...mainDailyTable };
                    for (const row of response.data) {
                        const dailyCell = {
                            hour: row.hour,
                            class: row.class,
                            subject: row.subject,
                            headerCol: { headerTeacher: row.headerCol.headerTeacher, type },
                        } as DailyScheduleCell;

                        const newDailyRow = addNewTeacherValueCell(
                            school,
                            dailyCell,
                            columnId,
                            selectedDate,
                            type,
                        );
                        if (newDailyRow) {
                            const response = await addDailyTeacherCellAction(newDailyRow);
                            if (response.success && response.data) {
                                dailyCell.DBid = response.data.id;
                                updatedSchedule = updateAddCell(
                                    response.data.id,
                                    updatedSchedule,
                                    selectedDate,
                                    dailyCell,
                                    columnId,
                                    {},
                                );
                            }
                        }
                    }

                    const headerTeacher = response.data[0].headerCol.headerTeacher;
                    updatedSchedule = fillLeftRowsWithEmptyCells(
                        updatedSchedule,
                        selectedDate,
                        columnId,
                        { headerTeacher, type },
                    );
                    setMainAndStorageTable(updatedSchedule);
                } else {
                    // If the teacher does not teach on this day, create an empty column
                    const headerTeacher = teachers?.find((t) => t.id === teacherId);
                    if (!headerTeacher) return;
                    const updatedSchedule = setEmptyTeacherColumn(
                        { ...mainDailyTable },
                        selectedDate,
                        columnId,
                        type,
                        headerTeacher,
                    );
                    setMainAndStorageTable(updatedSchedule);
                }
                return response.data;
            }
            return undefined;
        } catch (error) {
            console.error("Error fetching teacher schedule:", error);
            return undefined;
        }
    };

    const updateTeacherCell = async (
        selectedDate: string,
        type: ColumnType,
        cellData: DailyScheduleCell,
        columnId: string,
        dailyScheduleId: string,
        data: { event?: string; subTeacher?: TeacherType },
    ) => {
        if (!school) return;

        const dailyCellData = addNewTeacherValueCell(
            school,
            cellData,
            columnId,
            selectedDate,
            type,
            data.subTeacher,
            data.event,
        );
        if (dailyCellData) {
            const response = await updateDailyTeacherCellAction(dailyScheduleId, dailyCellData);
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
                pushIfPublished(selectedDate);
                return response.data;
            }
        }
        return undefined;
    };

    const clearTeacherCell = async (
        selectedDate: string,
        type: ColumnType,
        cellData: DailyScheduleCell,
        columnId: string,
        dailyScheduleId: string,
    ) => {
        if (!school) return;
        const dailyCellData = addNewTeacherValueCell(
            school,
            cellData,
            columnId,
            selectedDate,
            type,
            undefined,
            undefined,
        );

        if (dailyCellData) {
            const response = await updateDailyTeacherCellAction(dailyScheduleId, dailyCellData);
            if (response?.success && response.data) {
                const updatedSchedule = updateAddCell(
                    response.data.id,
                    mainDailyTable,
                    selectedDate,
                    cellData,
                    columnId,
                    { subTeacher: undefined, event: undefined },
                );
                setMainAndStorageTable(updatedSchedule);
                pushIfPublished(selectedDate);
                return response.data;
            }
        }
        return undefined;
    };

    return {
        populateTeacherColumn,
        updateTeacherCell,
        clearTeacherCell,
    };
};

export default useDailyTeacherActions;
