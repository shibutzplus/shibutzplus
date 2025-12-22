import React, { useState } from "react";
import InputText from "../../../ui/inputs/InputText/InputText";
import { useDailyTableContext } from "@/context/DailyTableContext";
import { errorToast } from "@/lib/toast";
import messages from "@/resources/messages";
import { ColumnType } from "@/models/types/dailySchedule";
import useDeletePopup from "@/hooks/useDeletePopup";
import Icons from "@/style/icons";
import styles from "../DailyTable/DailyTable.module.css";

type DailyEventHeaderProps = {
    columnId: string;
    type: ColumnType;
    onDelete?: (colId: string) => void;
};

const DailyEventHeader: React.FC<DailyEventHeaderProps> = ({ columnId, onDelete }) => {
    const { populateEventColumn, deleteColumn, mainDailyTable, selectedDate } =
        useDailyTableContext();

    const selectedEventData =
        mainDailyTable[selectedDate]?.[columnId]?.["1"]?.headerCol?.headerEvent;

    const [prevValue, setPrevValue] = useState<string>(selectedEventData || "");

    const handleChange = (e: React.FocusEvent<HTMLInputElement>) => {
        const newValue = e.target.value.trim();

        // Prevent empty header if there was a previous saved value
        if (prevValue && newValue === "") {
            errorToast("כותרת העמודה אינה יכולה להיות ריקה", Infinity);
            e.target.value = prevValue; // revert to previous value
            return;
        }

        if (prevValue !== newValue) {
            populateEventColumn(columnId, newValue);
            setPrevValue(newValue);
        }
    };

    const { handleOpenPopup } = useDeletePopup();

    const deleteCol = async () => {
        const response = await deleteColumn(columnId);
        if (!response) {
            errorToast(messages.dailySchedule.deleteError);
        }
    };

    const handleDeleteClick = () => {
        const deleteLabel = selectedEventData || "האירוע";
        const msg = `האם למחוק את ${deleteLabel}?`;

        if (onDelete) {
            handleOpenPopup("deleteDailyCol", msg, async () => onDelete(columnId));
        } else {
            handleOpenPopup("deleteDailyCol", msg, deleteCol);
        }
    };

    return (
        <div className={styles.headerContentWrapper}>
            <Icons.delete
                className={styles.trashIcon}
                onClick={handleDeleteClick}
                size={16}
                title="מחיקת עמודה"
            />
            <div className={styles.inputSelectWrapper}>
                <InputText
                    placeholder="כותרת האירוע"
                    onBlur={handleChange}
                    defaultValue={selectedEventData || ""}
                    backgroundColor="transparent"
                    hasBorder={false}
                    fontSize="18px"
                />
            </div>
        </div>
    );
};

export default DailyEventHeader;
