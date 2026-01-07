import React, { useState } from "react";
import styles from "./DailyEventCell.module.css";
import InputTextArea from "../../../ui/inputs/InputTextArea/InputTextArea";
import messages from "@/resources/messages";
import { errorToast } from "@/lib/toast";
import { useDailyTableContext } from "@/context/DailyTableContext";
import { DailyScheduleCell } from "@/models/types/dailySchedule";
import { formatTMDintoDMY } from "@/utils/time";

type DailyEventCellProps = { columnId: string; cell: DailyScheduleCell };

const DailyEventCell: React.FC<DailyEventCellProps> = ({ columnId, cell }) => {
    const { mainDailyTable, addEventCell, updateEventCell, deleteEventCell, selectedDate, populateEventColumn } =
        useDailyTableContext();
    const [isLoading, setIsLoading] = useState(false);

    const hour = cell?.hour;
    const eventData = cell?.event;
    const headerData = cell?.headerCol;

    const [info, setInfo] = useState<string>(eventData || "");
    const [prevInfo, setPrevInfo] = useState<string>(eventData || "");

    const handleChange = async (value: string) => {
        if (!hour || !columnId || !selectedDate) return;

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
        setPrevInfo(event);

        try {
            setIsLoading(true);
            let cellData = mainDailyTable[selectedDate]?.[columnId]?.[hour];
            if (!cellData) return;

            // Patch cellData if we just auto-filled the header title locally
            if (!cellData.headerCol?.headerEvent && currentHeaderTitle) {
                cellData = {
                    ...cellData,
                    headerCol: {
                        ...(cellData.headerCol || { type: "event" }),
                        headerEvent: currentHeaderTitle,
                        type: cellData.headerCol?.type || "event",
                    },
                };
            }

            let response;
            if (event === "") {
                const existingId = cellData?.DBid;
                if (existingId) {
                    response = await deleteEventCell(cellData, columnId, existingId);
                }
            } else if (eventData) {
                const existingId = cellData?.DBid;
                if (existingId) {
                    response = await updateEventCell(cellData, columnId, existingId, event);
                }
            } else {
                response = await addEventCell(cellData, columnId, { event });
            }

            if (!response) {
                errorToast(
                    eventData
                        ? messages.dailySchedule.updateError
                        : messages.dailySchedule.createError,
                );
                setInfo("");
            }
        } catch {
            errorToast(
                eventData ? messages.dailySchedule.updateError : messages.dailySchedule.createError,
            );
            setInfo("");
        } finally {
            setIsLoading(false);
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

export default DailyEventCell;
