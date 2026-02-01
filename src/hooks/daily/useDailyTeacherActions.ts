import { deleteDailyColumnAction } from "@/app/actions/DELETE/deleteDailyColumnAction";
import { getTeacherScheduleByDayAction } from "@/app/actions/GET/getTeacherScheduleByDayAction";
import { addDailyTeacherCellsAction } from "@/app/actions/POST/addDailyTeacherCellsAction";
import { updateDailyTeacherCellAction } from "@/app/actions/PUT/updateDailyTeacherCellAction";
import { useMainContext } from "@/context/MainContext";
import { ColumnType, DailySchedule, DailyScheduleCell, DailyScheduleType, TeacherHourlyScheduleItem } from "@/models/types/dailySchedule";
import { TeacherType } from "@/models/types/teachers";
import { addNewTeacherValueCell } from "@/services/daily/add";
import { fillLeftRowsWithEmptyCells } from "@/services/daily/populate";
import { setEmptyTeacherColumn } from "@/services/daily/setEmpty";
import { updateAddCell } from "@/services/daily/update";
import { logErrorAction } from "@/app/actions/POST/logErrorAction";

const useDailyTeacherActions = (
    mainDailyTable: DailySchedule,
    setMainAndStorageTable: (newSchedule: DailySchedule) => void,
    clearColumn: (day: string, columnId: string) => void,

) => {
    const { school, teachers, settings } = useMainContext();
    const populateTeacherColumn = async (
        selectedDate: string,
        columnId: string,
        dayNumber: number,
        teacherId: string,
        type: ColumnType,
    ) => {
        const schoolId = school?.id;
        if (!schoolId) return;

        const currentPosition = mainDailyTable[selectedDate]?.[columnId]?.["1"]?.headerCol?.position || 0;

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
                        currentPosition,
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
            const colData = mainDailyTable[selectedDate]?.[columnId];
            const hasSavedData = colData ? Object.values(colData).some((cell) => !!cell.DBid) : false;

            // Start promises in parallel
            let deletePromise: ReturnType<typeof deleteDailyColumnAction> | undefined;
            if (hasSavedData) {
                deletePromise = deleteDailyColumnAction(school.id, columnId, selectedDate);
            }

            const fetchPromise = getTeacherScheduleByDayAction(schoolId, dayNumber, teacherId);

            // Await both
            const [deleteResponse, fetchResponse] = await Promise.all([deletePromise, fetchPromise]);

            if (deleteResponse) {
                if (!deleteResponse.success || !deleteResponse.dailySchedules) {
                    logErrorAction({
                        description: `Failed to delete teacher daily column: ${deleteResponse.message}`,
                        schoolId: school?.id
                    });
                }
            }

            const response = fetchResponse;
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
                            headerCol: { headerTeacher: row.headerCol.headerTeacher, type, position: currentPosition },
                        } as DailyScheduleCell;

                        const newDailyRow = addNewTeacherValueCell(
                            school,
                            dailyCell,
                            columnId,
                            selectedDate,
                            type,
                            undefined,
                            undefined,
                            currentPosition
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
                        { headerTeacher, type, position: currentPosition },
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
                        currentPosition,
                        settings?.hoursNum,
                        headerTeacher,
                    );
                    setMainAndStorageTable(updatedSchedule);
                }
                return response.data;
            }
            return undefined;
        } catch (error) {
            logErrorAction({ description: `Error fetching teacher schedule: ${error instanceof Error ? error.message : String(error)}`, schoolId: school?.id });
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
        const currentPosition = mainDailyTable[selectedDate]?.[columnId]?.["1"]?.headerCol?.position || 0;

        const dailyCellData = addNewTeacherValueCell(
            school,
            cellData,
            columnId,
            selectedDate,
            type,
            data.subTeacher,
            data.event,
            currentPosition,
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
        const currentPosition = mainDailyTable[selectedDate]?.[columnId]?.["1"]?.headerCol?.position || 0;
        const dailyCellData = addNewTeacherValueCell(
            school,
            cellData,
            columnId,
            selectedDate,
            type,
            undefined,
            undefined,
            currentPosition,
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
