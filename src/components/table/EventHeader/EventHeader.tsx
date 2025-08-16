import React from "react";
import styles from "./EventHeader.module.css";
import InputText from "../../ui/InputText/InputText";
import useDeletePopup from "@/hooks/useDeletePopup";
import { PopupAction } from "@/context/PopupContext";
import { errorToast, successToast } from "@/lib/toast";
import messages from "@/resources/messages";
import { useDailyTableContext } from "@/context/DailyTableContext";
import { useTopNav } from "@/context/TopNavContext";

type EventHeaderProps = {
    columnId: string;
};

const EventHeader: React.FC<EventHeaderProps> = ({ columnId }) => {
    const { handleOpenPopup } = useDeletePopup();
    const { deleteColumn, populateEventColumn, dailySchedule } = useDailyTableContext();
    const { selectedDate } = useTopNav();

    const selectedEventData =
        dailySchedule[selectedDate]?.[columnId]?.["1"]?.headerCol?.headerEvent;

    const handleChange = (value: string) => {
        if (value.trim()) {
            populateEventColumn(columnId, value);
        }
    };

    const deleteCol = async () => {
        const response = await deleteColumn(columnId);
        if (response) {
            successToast(messages.dailySchedule.deleteSuccess);
        } else {
            errorToast(messages.dailySchedule.deleteError);
        }
    };

    const handleDeleteColumn = (e: React.MouseEvent) => {
        e.stopPropagation();
        handleOpenPopup(
            PopupAction.deleteDailyCol,
            `האם אתה בטוח שברצונך למחוק את השורה`,
            deleteCol,
        );
    };

    return (
        <div className={styles.columnHeader}>
            <button className={styles.clearButton} onClick={handleDeleteColumn}>
                הסר
            </button>
            <InputText
                placeholder="מידע"
                backgroundColor="transparent"
                onBlur={(e) => handleChange(e.target.value)}
                defaultValue={selectedEventData || ""}
            />
        </div>
    );
};

export default EventHeader;
