import React, { useState } from "react";
import styles from "./MngrDailyBldEventCell.module.css";
import InputTextArea from "../../../ui/inputs/InputTextArea/InputTextArea";
import messages from "@/resources/messages";
import { errorToast } from "@/lib/toast";
import { useDailyTableContext } from "@/context/DailyTableContext";
import { ColumnTypeValues, DailyScheduleCell } from "@/models/types/dailySchedule";
import { formatTMDintoDMY } from "@/utils/time";
import { logErrorAction } from "@/app/actions/POST/logErrorAction";
import { usePopup } from "@/context/PopupContext";
import RecurringChoicePopup, { RecurringChoiceMode } from "@/components/popups/RecurringChoicePopup/RecurringChoicePopup";

type MngrDailyBldEventCellProps = { columnId: string; cell: DailyScheduleCell };

const MngrDailyBldEventCell: React.FC<MngrDailyBldEventCellProps> = ({ columnId, cell }) => {
    const { mainDailyTable, addEventCell, updateEventCell, deleteEventCell, selectedDate, populateEventColumn, updateRecurringFromDate, detachRecurringColumn } = useDailyTableContext();
    const { openPopup } = usePopup();
    const [isLoading, setIsLoading] = useState(false);

    const hour = cell?.hour;
    const eventData = cell?.event;
    const headerData = cell?.headerCol;

    const [info, setInfo] = useState<string>(eventData || "");
    const [prevInfo, setPrevInfo] = useState<string>(eventData || "");

    // Detect if this column is part of a recurring series
    const isRecurring = columnId.startsWith("rec_");

    /**
     * Core save logic: saves (add / update / delete) for a specific columnId and event value.
     * Used for both regular and post-detach saves.
     * Returns true if saved successfully, false otherwise.
     */
    const saveCellChange = async (
        activeColumnId: string,
        event: string,
        currentHeaderTitle: string | undefined,
    ): Promise<boolean> => {
        try {
            setIsLoading(true);
            let cellData = mainDailyTable[selectedDate]?.[activeColumnId]?.[hour];
            if (!cellData) return false;

            // Patch cellData only if the header title was just auto-filled and not yet in store
            if (!cellData.headerCol?.headerEvent && currentHeaderTitle) {
                cellData = {
                    ...cellData,
                    headerCol: {
                        ...(cellData.headerCol || { type: ColumnTypeValues.event }),
                        headerEvent: currentHeaderTitle,
                        type: cellData.headerCol?.type || ColumnTypeValues.event,
                    },
                };
            }

            const existingId = cellData?.DBid;
            let response;
            if (event === "") {
                if (existingId) {
                    response = await deleteEventCell(cellData, activeColumnId, existingId);
                } else {
                    // Nothing to delete from DB, treat as successful clear
                    setInfo("");
                    setPrevInfo("");
                    return true;
                }
            } else if (existingId) {
                response = await updateEventCell(cellData, activeColumnId, existingId, event);
            } else {
                response = await addEventCell(cellData, activeColumnId, { event });
            }

            if (response) {
                setPrevInfo(event);
                return true;
            }

            logErrorAction({
                description: `Failed to save event cell: response returned falsy`,
                metadata: { columnId: activeColumnId, hour, selectedDate, event }
            });
            errorToast(
                eventData
                    ? messages.dailySchedule.updateError
                    : messages.dailySchedule.createError,
            );
            setInfo(prevInfo);
            return false;
        } catch (err) {
            logErrorAction({
                description: `Exception in MngrDailyBldEventCell handleChange: ${err instanceof Error ? err.message : String(err)}`,
                metadata: { columnId: activeColumnId, hour, selectedDate, event }
            });
            errorToast(
                eventData ? messages.dailySchedule.updateError : messages.dailySchedule.createError,
            );
            setInfo(prevInfo);
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = async (value: string) => {
        if (hour === undefined || !columnId || !selectedDate) return;

        const event = value.trim();
        if (event === prevInfo) return;

        let currentHeaderTitle = headerData?.headerEvent;

        if (!currentHeaderTitle && event) {
            // Auto-fill header with date if empty
            if (selectedDate) {
                const defaultDateTitle = formatTMDintoDMY(selectedDate);
                await populateEventColumn(columnId, defaultDateTitle);
                currentHeaderTitle = defaultDateTitle;
            }
        }

        setInfo(event);

        if (isRecurring) {
            const originalEvent = prevInfo;
            // For recurring columns, ask the user about the scope
            openPopup(
                "recurringChoice",
                "S",
                <RecurringChoicePopup
                    text="האם לשנות את תוכן האירוע?"
                    singleLabel="רק עבור יום זה"
                    futureLabel="מעכשיו ועד סוף השנה"
                    onChoice={async (mode: RecurringChoiceMode) => {
                        if (mode === "single") {
                            // Detach this day from the series, then save normally
                            const newColId = await detachRecurringColumn?.(columnId, selectedDate);
                            if (newColId) {
                                await saveCellChange(newColId, event, currentHeaderTitle);
                            } else {
                                await saveCellChange(columnId, event, currentHeaderTitle);
                            }
                        } else {
                            // Update this cell and propagate to all future weeks
                            const isSaved = await saveCellChange(columnId, event, currentHeaderTitle);
                            if (isSaved) {
                                // Propagate to future weeks using hourFilter (even if event is empty/cleared)
                                await updateRecurringFromDate?.(columnId, selectedDate, { event }, hour);
                            }
                        }
                    }}
                    onCancel={() => {
                        setInfo(originalEvent);
                    }}
                />,
            );
        } else {
            // Regular (non-recurring) column – save directly
            await saveCellChange(columnId, event, currentHeaderTitle);
        }
    };

    const cellRef = React.useRef<HTMLDivElement>(null);
    const [hasScroll, setHasScroll] = useState(false);

    React.useEffect(() => {
        const textarea = cellRef.current?.querySelector("textarea");
        if (textarea) {
            // Check if height exceeds ~3.5 lines (approx 80px)
            // 3 lines ~ 72px, 4 lines ~ 96px
            setHasScroll(textarea.scrollHeight > 80);
        } else if (cellRef.current) {
            setHasScroll(cellRef.current.scrollHeight > cellRef.current.clientHeight);
        }
    }, [info]);

    return (
        <div
            className={`${styles.cellContent} ${hasScroll ? styles.hasScroll : ""}`}
            ref={cellRef}
        >
            <InputTextArea
                value={info}
                onChange={(e) => setInfo(e.target.value)}
                onBlur={(e) => handleChange(e.target.value)}
                placeholder="מה מתוכנן?"
                disabled={isLoading}
                autoGrow
            />
        </div>
    );
};

export default MngrDailyBldEventCell;
