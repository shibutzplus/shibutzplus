import { deleteDailyCellAction } from "@/app/actions/DELETE/deleteDailyCellAction";
import { addDailyGuardCellAction } from "@/app/actions/POST/addDailyGuardCellAction";
import { updateDailyGuardCellAction } from "@/app/actions/PUT/updateDailyGuardCellAction";
import { updateDailyEventHeaderAction } from "@/app/actions/PUT/updateDailyEventHeaderAction";
import { useMainContext } from "@/context/MainContext";
import { ColumnTypeValues, DailySchedule, DailyScheduleCell } from "@/models/types/dailySchedule";
import { DEFAULT_GUARD_TITLE } from "@/models/constant/daily";
import { addNewGuardCell } from "@/services/daily/add";
import { fillLeftRowsWithEmptyCells, initDailySchedule } from "@/services/daily/populate";
import { updateAddGuardCell, updateAllGuardHeader, updateDeleteCell } from "@/services/daily/update";
import { getDayNumberByDateString } from "@/utils/time";
import { logErrorAction } from "@/app/actions/POST/logErrorAction";
import { Dispatch, SetStateAction } from "react";

const useDailyGuardActions = (
    mainDailyTable: DailySchedule,
    setMainDailyTable: Dispatch<SetStateAction<DailySchedule>>,
    selectedDate: string,
) => {
    const { school, settings } = useMainContext();

    const populateGuardColumn = async (columnId: string, guardTitle: string = DEFAULT_GUARD_TITLE) => {
        const alreadyExists = mainDailyTable[selectedDate]?.[columnId];
        const currentPosition = alreadyExists?.["1"]?.headerCol?.position || 0;
        let isUpdateSuccess = false;

        const hasSavedData = alreadyExists ? Object.values(alreadyExists).some(cell => !!cell.DBid) : false;

        if (hasSavedData && alreadyExists && alreadyExists["1"]?.headerCol?.type === ColumnTypeValues.guard) {
            const response = await updateDailyEventHeaderAction(selectedDate, columnId, guardTitle);
            if (response.success) {
                isUpdateSuccess = true;
                setMainDailyTable(prev => {
                    let updatedSchedule = { ...prev };
                    updatedSchedule = updateAllGuardHeader(
                        updatedSchedule,
                        selectedDate,
                        columnId,
                        guardTitle,
                    );
                    updatedSchedule = fillLeftRowsWithEmptyCells(updatedSchedule, selectedDate, columnId, {
                        headerEvent: guardTitle,
                        type: ColumnTypeValues.guard,
                        position: currentPosition,
                    }, settings?.fromHour ?? 1, settings?.toHour ?? 10);
                    return updatedSchedule;
                });
            } else {
                logErrorAction({
                    description: `Update failed for daily guard header: ${response.message}`,
                    schoolId: school?.id,
                    metadata: { selectedDate, columnId, guardTitle }
                });
            }
        }

        if (!isUpdateSuccess && school?.id) {
            const day = getDayNumberByDateString(selectedDate);
            const response = await addDailyGuardCellAction({
                date: new Date(selectedDate),
                day: day,
                hour: -1,
                columnId,
                school: school,
                columnType: ColumnTypeValues.guard,
                eventTitle: guardTitle,
                event: "",
                position: currentPosition,
            });

            if (response.success && response.data?.id) {
                setMainDailyTable(prev => {
                    let updatedSchedule = { ...prev };

                    if (updatedSchedule[selectedDate]) {
                        updatedSchedule[selectedDate] = { ...updatedSchedule[selectedDate] };
                        updatedSchedule[selectedDate][columnId] = {};
                    }

                    updatedSchedule = initDailySchedule(updatedSchedule, selectedDate, columnId);

                    updatedSchedule[selectedDate][columnId]["-1"] = {
                        hour: -1,
                        DBid: response.data!.id,
                        headerCol: {
                            headerEvent: guardTitle,
                            type: ColumnTypeValues.guard,
                            position: currentPosition,
                        },
                    };

                    updatedSchedule = fillLeftRowsWithEmptyCells(updatedSchedule, selectedDate, columnId, {
                        headerEvent: guardTitle,
                        type: ColumnTypeValues.guard,
                        position: currentPosition,
                    }, settings?.fromHour ?? 1, settings?.toHour ?? 10);

                    return updatedSchedule;
                });
            } else {
                logErrorAction({
                    description: `Failed to create new daily guard column: ${response.message}`,
                    schoolId: school?.id,
                    metadata: { selectedDate, columnId, guardTitle }
                });
            }
        }
    };

    const addGuardCell = async (
        cellData: DailyScheduleCell,
        columnId: string,
        data: { event?: string; guardTeacherIds?: string[]; instructions?: string | null },
    ) => {
        if (!school) return;
        const currentPosition = mainDailyTable[selectedDate]?.[columnId]?.["1"]?.headerCol?.position ?? cellData.headerCol?.position ?? 0;
        const dailyCellData = addNewGuardCell(school, cellData, columnId, selectedDate, data, currentPosition);
        if (dailyCellData) {
            const response = await addDailyGuardCellAction(dailyCellData);
            if (response?.success && response.data) {
                setMainDailyTable(prev => updateAddGuardCell(
                    response.data!.id,
                    prev,
                    selectedDate,
                    cellData,
                    columnId,
                    data,
                    cellData.headerCol?.headerEvent || DEFAULT_GUARD_TITLE,
                ));
                return response.data;
            } else {
                logErrorAction({
                    description: `Failed to add guard cell: ${response?.message}`,
                    schoolId: school?.id,
                    metadata: { selectedDate, columnId, event: data.event, hour: cellData.hour }
                });
            }
        }
    };

    const updateGuardCell = async (
        cellData: DailyScheduleCell,
        columnId: string,
        dailyScheduleId: string,
        data: { event?: string; guardTeacherIds?: string[]; instructions?: string | null },
    ) => {
        if (!school) return;
        const currentPosition = mainDailyTable[selectedDate]?.[columnId]?.["1"]?.headerCol?.position ?? cellData.headerCol?.position ?? 0;
        const dailyCellData = addNewGuardCell(school, cellData, columnId, selectedDate, data, currentPosition);
        if (dailyCellData) {
            const response = await updateDailyGuardCellAction(dailyScheduleId, dailyCellData);
            if (response?.success && response.data) {
                setMainDailyTable(prev => updateAddGuardCell(
                    response.data!.id,
                    prev,
                    selectedDate,
                    cellData,
                    columnId,
                    data,
                ));
                return response.data;
            } else {
                logErrorAction({
                    description: `Failed to update guard cell: ${response?.message}`,
                    schoolId: school?.id,
                    metadata: { selectedDate, columnId, dailyScheduleId, event: data.event, hour: cellData.hour }
                });
            }
        }
        return undefined;
    };

    const deleteGuardCell = async (
        cellData: DailyScheduleCell,
        columnId: string,
        dailyScheduleId: string,
    ) => {
        if (!school) return;
        const response = await deleteDailyCellAction(school.id, dailyScheduleId);
        if (response?.success && response.deletedRowId) {
            setMainDailyTable(prev => updateDeleteCell(
                response.deletedRowId!,
                prev,
                selectedDate,
                cellData,
                columnId,
            ));
            return true;
        } else {
            logErrorAction({
                description: `Failed to delete guard cell: ${response?.message}`,
                schoolId: school?.id,
                metadata: { selectedDate, columnId, dailyScheduleId }
            });
        }
    };

    return {
        populateGuardColumn,
        addGuardCell,
        updateGuardCell,
        deleteGuardCell,
    };
};

export default useDailyGuardActions;
