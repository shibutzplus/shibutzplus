import { deleteDailyCellAction } from "@/app/actions/DELETE/deleteDailyCellAction";
import { deleteDailyColumnAction } from "@/app/actions/DELETE/deleteDailyColumnAction";
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
import { formatTMDintoDMY, getDayNumberByDateString } from "@/utils/time";
import { logErrorAction } from "@/app/actions/POST/logErrorAction";
import { Dispatch, SetStateAction } from "react";

const useDailyEventActions = (
    mainDailyTable: DailySchedule,
    setMainDailyTable: Dispatch<SetStateAction<DailySchedule>>,
    selectedDate: string,
) => {
    const { school, settings } = useMainContext();
    const populateEventColumn = async (columnId: string, eventTitle: string) => {
        const alreadyExists = mainDailyTable[selectedDate]?.[columnId];
        const currentPosition = alreadyExists?.["1"]?.headerCol?.position || 0;

        let isUpdateSuccess = false;

        // Check if DB records exist for this column
        const hasSavedData = alreadyExists ? Object.values(alreadyExists).some(cell => !!cell.DBid) : false;

        // Try to update existing column first ONLY if we know it exists in DB
        if (hasSavedData && alreadyExists && alreadyExists["1"]?.headerCol?.type === ColumnTypeValues.event) {
            const response = await updateDailyEventHeaderAction(selectedDate, columnId, eventTitle);
            if (response.success) {
                isUpdateSuccess = true;
                setMainDailyTable(prev => {
                    let updatedSchedule = { ...prev };
                    updatedSchedule = updateAllEventHeader(
                        updatedSchedule,
                        selectedDate,
                        columnId,
                        eventTitle,
                    );
                    updatedSchedule = fillLeftRowsWithEmptyCells(updatedSchedule, selectedDate, columnId, {
                        headerEvent: eventTitle,
                        type: ColumnTypeValues.event,
                        position: currentPosition,
                    }, settings?.fromHour ?? 1, settings?.toHour ?? 10);
                    return updatedSchedule;
                });
            } else {
                logErrorAction({
                    description: `Update failed for daily event header: ${response.message}`,
                    schoolId: school?.id,
                    metadata: { selectedDate, columnId, eventTitle }
                });
            }
        }

        // If update was skipped or failed, treat as new column creation
        if (!isUpdateSuccess) {
            // Create a new entry in DB
            if (school?.id) {
                const day = getDayNumberByDateString(selectedDate);
                const response = await addDailyEventCellAction({
                    date: new Date(selectedDate),
                    day: day,
                    hour: -1,
                    columnId,
                    school: school,
                    columnType: ColumnTypeValues.event,
                    eventTitle,
                    event: eventPlaceholder,
                    position: currentPosition,
                });

                if (response.success && response.data?.id) {
                    setMainDailyTable(prev => {
                        let updatedSchedule = { ...prev };

                        // Explicitly clear local copy so fillLeftRowsWithEmptyCells regenerates the cells with new header
                        if (updatedSchedule[selectedDate]) {
                            updatedSchedule[selectedDate] = { ...updatedSchedule[selectedDate] };
                            updatedSchedule[selectedDate][columnId] = {};
                        }

                        updatedSchedule = initDailySchedule(updatedSchedule, selectedDate, columnId);

                        updatedSchedule[selectedDate][columnId]["-1"] = {
                            hour: -1,
                            DBid: response.data!.id,
                            headerCol: {
                                headerEvent: eventTitle,
                                type: ColumnTypeValues.event,
                                position: currentPosition,
                            },
                        };

                        updatedSchedule = fillLeftRowsWithEmptyCells(updatedSchedule, selectedDate, columnId, {
                            headerEvent: eventTitle,
                            type: ColumnTypeValues.event,
                            position: currentPosition,
                        }, settings?.fromHour ?? 1, settings?.toHour ?? 10);

                        return updatedSchedule;
                    });
                } else {
                    logErrorAction({
                        description: `Failed to create new daily event column: ${response.message}`,
                        schoolId: school?.id,
                        metadata: { selectedDate, columnId, eventTitle }
                    });
                }
            }
        }
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
                setMainDailyTable(prev => updateAddCell(
                    response.data!.id,
                    prev,
                    selectedDate,
                    cellData,
                    columnId,
                    data,
                    cellData.headerCol?.headerEvent,
                ));
                return response.data;
            } else {
                logErrorAction({
                    description: `Failed to add event cell: ${response?.message}`,
                    schoolId: school?.id,
                    metadata: { selectedDate, columnId, eventTitle, hour: cellData.hour }
                });
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
                setMainDailyTable(prev => updateAddCell(
                    response.data!.id,
                    prev,
                    selectedDate,
                    cellData,
                    columnId,
                    { event },
                ));
                return response.data;
            } else {
                logErrorAction({
                    description: `Failed to update event cell: ${response?.message}`,
                    schoolId: school?.id,
                    metadata: { selectedDate, columnId, dailyScheduleId, event, hour: cellData.hour }
                });
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
                description: `Failed to delete event cell: ${response?.message}`,
                schoolId: school?.id,
                metadata: { selectedDate, columnId, dailyScheduleId }
            });
        }
    };

    const pasteEventColumn = async (
        columnId: string,
        pastedColumnData: { [hour: string]: DailyScheduleCell },
    ) => {
        const schoolId = school?.id;
        if (!schoolId) return false;

        const currentPosition = mainDailyTable[selectedDate]?.[columnId]?.["1"]?.headerCol?.position || 0;
        const eventTitle = pastedColumnData["1"]?.headerCol?.headerEvent || formatTMDintoDMY(selectedDate);

        try {
            // 1. Clear existing data in DB
            const colData = mainDailyTable[selectedDate]?.[columnId];
            const hasSavedData = colData ? Object.values(colData).some(cell => !!cell.DBid) : false;

            if (hasSavedData) {
                await deleteDailyColumnAction(schoolId, columnId, selectedDate);
            }

            const day = getDayNumberByDateString(selectedDate);

            // Paste header row 0
            const headerResponse = await addDailyEventCellAction({
                date: new Date(selectedDate),
                day: day,
                hour: -1,
                columnId,
                school: school,
                columnType: ColumnTypeValues.event,
                eventTitle,
                event: eventPlaceholder,
                position: currentPosition,
            });

            if (headerResponse.success && headerResponse.data?.id) {
                // Immediate update for header
                setMainDailyTable(prev => {
                    const updatedSchedule = { ...prev };

                    if (updatedSchedule[selectedDate]) {
                        updatedSchedule[selectedDate] = { ...updatedSchedule[selectedDate] };
                        updatedSchedule[selectedDate][columnId] = {};
                    } else {
                        updatedSchedule[selectedDate] = { [columnId]: {} };
                    }

                    if (!updatedSchedule[selectedDate][columnId]) updatedSchedule[selectedDate][columnId] = {};

                    updatedSchedule[selectedDate][columnId]["-1"] = {
                        hour: -1,
                        DBid: headerResponse.data!.id,
                        headerCol: {
                            headerEvent: eventTitle,
                            type: ColumnTypeValues.event,
                            position: currentPosition,
                        },
                    };
                    return updatedSchedule;
                });
            }

            // Paste other cells - Prepare promises
            const cellPromises = Object.keys(pastedColumnData).map((hourKey) => {
                const hour = parseInt(hourKey);
                if (isNaN(hour) || hour === -1) return null;

                const sourceCell = pastedColumnData[hourKey];
                if (sourceCell.event === undefined) return null;

                const dailyCellData = addNewEventCell(school, sourceCell, columnId, selectedDate, sourceCell.event || "", currentPosition);
                if (!dailyCellData) return null;

                return {
                    promise: addDailyEventCellAction(dailyCellData),
                    sourceCell
                };
            }).filter((item): item is NonNullable<typeof item> => item !== null);

            // Execute all requests in parallel
            const results = await Promise.all(cellPromises.map(item => item.promise));

            // Single batch update for all cells and final fill
            setMainDailyTable(prev => {
                let updatedSchedule = { ...prev };

                results.forEach((response, index) => {
                    const { sourceCell } = cellPromises[index];
                    if (response?.success && response.data) {
                        updatedSchedule = updateAddCell(
                            response.data!.id,
                            updatedSchedule,
                            selectedDate,
                            sourceCell,
                            columnId,
                            { event: sourceCell.event },
                            eventTitle
                        );
                    }
                });

                // Final fill
                updatedSchedule = fillLeftRowsWithEmptyCells(updatedSchedule, selectedDate, columnId, {
                    headerEvent: eventTitle,
                    type: ColumnTypeValues.event,
                    position: currentPosition,
                }, settings?.fromHour ?? 1, settings?.toHour ?? 10);

                return updatedSchedule;
            });

            return true;
        } catch (error) {
            logErrorAction({
                description: `Error pasting event column: ${error instanceof Error ? error.message : String(error)}`,
                schoolId: school?.id,
                metadata: { selectedDate, columnId }
            });
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