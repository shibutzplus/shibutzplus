import React, { useState } from "react";
import InputText from "../../../ui/inputs/InputText/InputText";
import { useDailyTableContext } from "@/context/DailyTableContext";
import { errorToast } from "@/lib/toast";
import messages from "@/resources/messages";
import useDeletePopup from "@/hooks/useDeletePopup";
import styles from "../DailyTable/DailyTable.module.css";
import { formatTMDintoDMY } from "@/utils/time";
import DailyColumnMenu from "../DailyColumnMenu/DailyColumnMenu";

type DailyEventHeaderProps = {
    columnId: string;
    onDelete?: (colId: string) => void;
    isFirst?: boolean;
    isLast?: boolean;
};

const DailyEventHeader: React.FC<DailyEventHeaderProps> = ({ columnId, onDelete, isFirst, isLast }) => {
    const { populateEventColumn, deleteColumn, mainDailyTable, selectedDate, moveColumn, isEditMode } =
        useDailyTableContext();

    const selectedEventData =
        mainDailyTable[selectedDate]?.[columnId]?.["1"]?.headerCol?.headerEvent;

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
            <DailyColumnMenu
                onDelete={handleDeleteClick}
                onMoveRight={() => moveColumn && moveColumn(columnId, "right")}
                onMoveLeft={() => moveColumn && moveColumn(columnId, "left")}
                isFirst={isFirst}
                isLast={isLast}
            />
            <div className={styles.inputSelectWrapper}>
                <div style={{ display: isEditMode ? "block" : "none", width: "100%" }}>
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
                <div
                    className={styles.staticHeaderText}
                    title={value || selectedEventData || ""}
                    style={{ display: isEditMode ? "none" : "flex" }}
                >
                    {value || selectedEventData || ""}
                </div>
            </div>
        </div>
    );
};

export default DailyEventHeader;
