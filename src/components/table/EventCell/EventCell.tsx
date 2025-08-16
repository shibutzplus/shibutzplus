import React, { useState } from "react";
import styles from "./EventCell.module.css";
import InputTextArea from "../../ui/InputTextArea/InputTextArea";
import messages from "@/resources/messages";
import { CellContext } from "@tanstack/react-table";
import { TeacherRow } from "@/models/types/table";
import { useDailyTableContext } from "@/context/DailyTableContext";
import { useTopNav } from "@/context/TopNavContext";
import { errorToast, successToast } from "@/lib/toast";

type EventCellProps = {
    cell: CellContext<TeacherRow, unknown>;
};

const EventCell: React.FC<EventCellProps> = ({ cell }) => {
    const { dailySchedule, addNewCell, dailyScheduleRawData } = useDailyTableContext();
    const { selectedDate } = useTopNav();
    const [isLoading, setIsLoading] = useState(false);

    // Get the current hour, event and headerCol from the row data
    const columnId = cell?.column?.id;
    const hour = cell?.row?.original?.hour.toString();
    const eventData = dailySchedule[selectedDate]?.[columnId]?.[hour]?.event;
    const headerData = dailySchedule[selectedDate]?.[columnId]?.[hour]?.headerCol;

    const [info, setInfo] = useState<string>(eventData || "");

    const handleChange = async (value: string) => {
        if (!hour || !columnId || !selectedDate || !headerData) return;
        setIsLoading(true);
        setInfo(value);

        try {
            const cellData = dailySchedule[selectedDate]?.[columnId]?.[hour];
            if (!cellData) return;

            let response;
            if (eventData) {
                const existingDailyEntry = dailyScheduleRawData?.find(
                    (entry) =>
                        entry.columnId === columnId &&
                        entry.hour === Number(hour) &&
                        entry.event === eventData,
                );
                if (existingDailyEntry) {
                    //update
                }
            } else {
                response = await addNewCell("event", cellData, columnId, selectedDate, {
                    event: info,
                });
            }

            if (response) {
                successToast(
                    eventData
                        ? messages.dailySchedule.updateSuccess
                        : messages.dailySchedule.createSuccess,
                );
            } else {
                errorToast(
                    eventData
                        ? messages.dailySchedule.updateError
                        : messages.dailySchedule.createError,
                );
                setInfo("");
            }
        } catch (error) {
            console.error("Error handling daily schedule entry:", error);
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
                rows={3}
            />
        </div>
    );
};

export default EventCell;
