import { deleteDailyColumnAction } from "@/app/actions/DELETE/deleteDailyColumnAction";
import { getTeacherScheduleByDayAction } from "@/app/actions/GET/getTeacherScheduleByDayAction";
import { addDailyTeacherCellsAction } from "@/app/actions/POST/addDailyTeacherCellsAction";
import { updateDailyTeacherCellAction } from "@/app/actions/PUT/updateDailyTeacherCellAction";
import { useMainContext } from "@/context/MainContext";
import { UPDATE_TEACHER } from "@/models/constant/sync";
import {
    ColumnType,
    DailySchedule,
    DailyScheduleCell,
    DailyScheduleType,
    TeacherHourlyScheduleItem,
} from "@/models/types/dailySchedule";
import { TeacherType } from "@/models/types/teachers";
import { addNewTeacherValueCell } from "@/services/daily/add";
import { fillLeftRowsWithEmptyCells } from "@/services/daily/populate";
import { setEmptyTeacherColumn } from "@/services/daily/setEmpty";
import { updateAddCell } from "@/services/daily/update";
import { pushSyncUpdate } from "@/services/syncService";

const useDailyTeacherActions = (
    mainDailyTable: DailySchedule,
    setMainAndStorageTable: (newSchedule: DailySchedule) => void,
    clearColumn: (day: string, columnId: string) => void,
) => {
    const { school, teachers, settings } = useMainContext();

    const pushIfPublished = (selectedDate: string) => {
        if (!!school?.publishDates?.includes(selectedDate)) pushSyncUpdate(UPDATE_TEACHER);
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
            // Optimistic update: Show new teacher name immediately
            if (teachers && teachers.length > 0) {
                const optimisticTeacher = teachers.find((t) => t.id === teacherId);
                if (optimisticTeacher) {
                    // Create a deep copy of the schedule for the specific date/column to avoid mutation issues
                    const optimisticSchedule = { ...mainDailyTable };
                    if (optimisticSchedule[selectedDate]) {
                        optimisticSchedule[selectedDate] = { ...optimisticSchedule[selectedDate] };
                        optimisticSchedule[selectedDate][columnId] = {}; // Clear existing column data first
                    }

                    const finalOptimisticSchedule = setEmptyTeacherColumn(
                        optimisticSchedule,
                        selectedDate,
                        columnId,
                        type,
                        settings?.hoursNum,
                        optimisticTeacher,
                    );
                    setMainAndStorageTable(finalOptimisticSchedule);
                } else {
                    clearColumn(selectedDate, columnId);
                }
            } else {
                // Fallback if teachers not loaded (unlikely)
                clearColumn(selectedDate, columnId);
            }

            // Capture the state needed for deletion BEFORE async operations
            // (though in this function scope, mainDailyTable is stale closure which is actually what we want for 'alreadyExists' check)
            const alreadyExists = mainDailyTable[selectedDate]?.[columnId];
            if (alreadyExists) {
                const response = await deleteDailyColumnAction(school.id, columnId, selectedDate);
                if (!response.success || !response.dailySchedules) {
                    console.error("Failed to delete teacher daily column:", response.message);
                }
            }

            // NOTE: We do NOT call clearColumn again here to avoid flicker.
            // The DB is cleared (if delete succeeded), and the UI shows the optimistic teacher.

            const response = await getTeacherScheduleByDayAction(schoolId, dayNumber, teacherId);
            if (response.success && response.data) {
                if (response.data.length > 0) {
                    const pendingInserts: {
                        request: ReturnType<typeof addNewTeacherValueCell>;
                        dailyCell: DailyScheduleCell;
                    }[] = [];

                    // We need to work on a fresh copy that doesn't have the "optimistic" empty cells
                    // (or previous data) so updateAddCell will use the new cellData (with class/subject)
                    let updatedSchedule: DailySchedule = { ...mainDailyTable };
                    if (updatedSchedule[selectedDate]) {
                        updatedSchedule[selectedDate] = { ...updatedSchedule[selectedDate] };
                        updatedSchedule[selectedDate][columnId] = {};
                    }

                    for (const row of response.data as TeacherHourlyScheduleItem[]) {
                        const dailyCell = {
                            hour: row.hour,
                            classes: row.classes,
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
                        if (newDailyRow) pendingInserts.push({ request: newDailyRow, dailyCell });
                    }

                    if (pendingInserts.length > 0) {
                        const batchResponse = await addDailyTeacherCellsAction(
                            pendingInserts.map((p) => p.request!),
                        );
                        if (batchResponse.success && batchResponse.data) {
                            batchResponse.data.forEach(
                                (savedCell: DailyScheduleType, index: number) => {
                                    const item = pendingInserts[index];
                                    if (item) {
                                        item.dailyCell.DBid = savedCell.id;
                                        updatedSchedule = updateAddCell(
                                            savedCell.id,
                                            updatedSchedule,
                                            selectedDate,
                                            item.dailyCell,
                                            columnId,
                                            {},
                                        );
                                    }
                                },
                            );
                        }
                    }

                    const headerTeacher = response.data[0].headerCol.headerTeacher;
                    updatedSchedule = fillLeftRowsWithEmptyCells(
                        updatedSchedule,
                        selectedDate,
                        columnId,
                        { headerTeacher, type },
                        settings?.hoursNum,
                    );
                    setMainAndStorageTable(updatedSchedule);
                } else {
                    // If the teacher does not teach on this day, create an empty column
                    // We re-affirm the empty column with the teacher header
                    const headerTeacher = teachers?.find((t) => t.id === teacherId);
                    if (!headerTeacher) return;
                    const updatedSchedule = setEmptyTeacherColumn(
                        { ...mainDailyTable },
                        selectedDate,
                        columnId,
                        type,
                        settings?.hoursNum,
                        headerTeacher,
                    );
                    setMainAndStorageTable(updatedSchedule);
                }
                return response.data;
            }
            return undefined;
        } catch (error) {
            console.error("Error fetching teacher schedule:", error);
            // On error we might want to reset? For now, leave it.
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
