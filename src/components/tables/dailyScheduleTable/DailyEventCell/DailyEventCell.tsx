import React, { useState } from "react";
import styles from "./DailyEventCell.module.css";
import InputTextArea from "../../../ui/inputs/InputTextArea/InputTextArea";
import messages from "@/resources/messages";
import { errorToast } from "@/lib/toast";
import { useDailyTableContext } from "@/context/DailyTableContextP";
import { DailyScheduleCell } from "@/models/types/dailySchedule";

type DailyEventCellProps = { columnId: string; cell: DailyScheduleCell };

const DailyEventCell: React.FC<DailyEventCellProps> = ({ columnId, cell }) => {
    const { mainDailyTable, addEventCell, updateEventCell, deleteEventCell, selectedDate } =
        useDailyTableContext();
    const [isLoading, setIsLoading] = useState(false);

    const hour = cell?.hour;
    const eventData = cell?.event;
    const headerData = cell?.headerCol;

    const [info, setInfo] = useState<string>(eventData || "");
    const [prevInfo, setPrevInfo] = useState<string>(eventData || "");

    const handleChange = async (value: string) => {
        if (!hour || !columnId || !selectedDate || !headerData) return;
        const event = value.trim();
        if (event === prevInfo) return;
        setInfo(event);
        setPrevInfo(event);

        try {
            setIsLoading(true);
            const cellData = mainDailyTable[selectedDate]?.[columnId]?.[hour];
            if (!cellData) return;

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

    return (
        <div className={styles.cellContent}>
            <InputTextArea
                value={info}
                onChange={(e) => setInfo(e.target.value)}
                onBlur={(e) => handleChange(e.target.value)}
                placeholder="מה מתוכנן לשעה זו?"
                disabled={isLoading}
                rows={1}
                autoGrow
            />
        </div>
    );
};

export default DailyEventCell;
