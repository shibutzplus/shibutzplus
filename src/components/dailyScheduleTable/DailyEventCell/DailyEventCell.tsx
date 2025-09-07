import React, { useState } from "react";
import styles from "./DailyEventCell.module.css";
import InputTextArea from "../../ui/InputTextArea/InputTextArea";
import messages from "@/resources/messages";
import { CellContext } from "@tanstack/react-table";
import { TeacherRow } from "@/models/types/table";
import { useDailyTableContext } from "@/context/DailyTableContext";
import { errorToast } from "@/lib/toast";

type DailyEventCellProps = { cell: CellContext<TeacherRow, unknown> };

const DailyEventCell: React.FC<DailyEventCellProps> = ({ cell }) => {
    const { mainDailyTable, addEventCell, updateEventCell, deleteEventCell, selectedDate } =
        useDailyTableContext();
    const [isLoading, setIsLoading] = useState(false);

    const columnId = cell?.column?.id;
    const hour = cell?.row?.original?.hour.toString();
    const eventData = mainDailyTable[selectedDate]?.[columnId]?.[hour]?.event;
    const headerData = mainDailyTable[selectedDate]?.[columnId]?.[hour]?.headerCol;

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
                const existingId = mainDailyTable[selectedDate]?.[columnId]?.[hour]?.DBid;
                if (existingId) {
                    response = await deleteEventCell(cellData, columnId, existingId);
                }
            } else if (eventData) {
                const existingId = mainDailyTable[selectedDate]?.[columnId]?.[hour]?.DBid;
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
                placeholder="מה הולך לקרות בשעה זו?"
                disabled={isLoading}
                rows={1}
                autoGrow
            />
        </div>
    );
};

export default DailyEventCell;
