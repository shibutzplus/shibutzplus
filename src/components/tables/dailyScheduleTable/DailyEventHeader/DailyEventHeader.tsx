import React, { useState } from "react";
import InputText from "../../../ui/inputs/InputText/InputText";
import { useDailyTableContext } from "@/context/DailyTableContext";
import EditableHeader from "../../../ui/table/EditableHeader/EditableHeader";
import { errorToast } from "@/lib/toast";
import messages from "@/resources/messages";
import { ColumnType } from "@/models/types/dailySchedule";
import { COLOR_BY_TYPE } from "@/models/constant/daily";

type DailyEventHeaderProps = {
    columnId: string;
    type: ColumnType;
};

const DailyEventHeader: React.FC<DailyEventHeaderProps> = ({ columnId, type }) => {
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

    const deleteCol = async () => {
        const response = await deleteColumn(columnId);
        if (!response) {
            errorToast(messages.dailySchedule.deleteError);
        }
    };

    return (
        <EditableHeader
            deleteLabel={selectedEventData || "האירוע"}
            color={COLOR_BY_TYPE[type]}
            deleteCol={deleteCol}
        >
            <InputText
                placeholder="כותרת האירוע"
                onBlur={handleChange}
                defaultValue={selectedEventData || ""}
                backgroundColor="transparent"
                hasBorder={false}
            />
        </EditableHeader>
    );
};

export default DailyEventHeader;
