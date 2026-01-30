import React, { useState } from "react";
import InputText from "../../../ui/inputs/InputText/InputText";
import { useDailyTableContext } from "@/context/DailyTableContext";
import { errorToast, successToast } from "@/lib/toast";
import messages from "@/resources/messages";
import useConfirmPopup from "@/hooks/useConfirmPopup";
import styles from "../DailyTable/DailyTable.module.css";
import { formatTMDintoDMY } from "@/utils/time";
import DailyColumnMenu from "../DailyColumnMenu/DailyColumnMenu";
import { useColumnClipboard } from "@/context/ColumnClipboardContext";
import { ColumnTypeValues } from "@/models/types/dailySchedule";

type DailyEventHeaderProps = {
    columnId: string;
    onDelete?: (colId: string) => void;
    isFirst?: boolean;
    isLast?: boolean;
};

const DailyEventHeader: React.FC<DailyEventHeaderProps> = ({ columnId, onDelete, isFirst, isLast }) => {
    const { populateEventColumn, deleteColumn, mainDailyTable, selectedDate, moveColumn, pasteEventColumn } =
        useDailyTableContext();
    const { hasClipboardData, pasteColumn, copyColumn } = useColumnClipboard();


    const columnData = mainDailyTable[selectedDate]?.[columnId] || {};
    const selectedEventData = columnData["1"]?.headerCol?.headerEvent;

    const handleCopy = () => {
        copyColumn(ColumnTypeValues.event, columnData);
        successToast("תוכן העמודה הועתק", 1000);
    };

    const [value, setValue] = useState(selectedEventData || "");
    const prevValueRef = React.useRef(selectedEventData || "");

    // Update local state when value from server changes (and we are not editing)
    React.useEffect(() => {
        setValue(selectedEventData || "");
        prevValueRef.current = selectedEventData || "";
    }, [selectedEventData]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setValue(e.target.value);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        let newValue = e.target.value.trim();

        // If empty, set default to current date
        if (newValue === "") {
            newValue = formatTMDintoDMY(selectedDate);
            setValue(newValue);
        }

        if (prevValueRef.current !== newValue) {
            populateEventColumn(columnId, newValue);
            prevValueRef.current = newValue;
        }
    };

    const { handleOpenPopup } = useConfirmPopup();

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

    const handlePaste = async () => {
        const clipboard = pasteColumn();
        if (!clipboard || clipboard.type !== ColumnTypeValues.event) return;

        const success = await pasteEventColumn(columnId, clipboard.columnData);
        if (success) {
            successToast("העמודה הודבקה בהצלחה", 1500);
        } else {
            errorToast("שגיאה בהדבקת העמודה");
        }
    };

    const showPaste = hasClipboardData(ColumnTypeValues.event);


    return (
        <div className={styles.headerContentWrapper}>
            <DailyColumnMenu
                onDelete={handleDeleteClick}
                onMoveRight={() => moveColumn && moveColumn(columnId, "right")}
                onMoveLeft={() => moveColumn && moveColumn(columnId, "left")}
                onPaste={handlePaste}
                onCopy={handleCopy}
                showPaste={showPaste}
                isFirst={isFirst}
                isLast={isLast}
            />
            <div className={styles.inputSelectWrapper}>
                <div style={{ width: "100%" }}>
                    <InputText
                        placeholder="כותרת האירוע"
                        value={value}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        backgroundColor="transparent"
                        hasBorder={false}
                        fontSize="18px"
                    />
                </div>
            </div>
        </div>
    );
};

export default DailyEventHeader;
