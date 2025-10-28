import React, { useState } from "react";
import InputText from "../../../ui/inputs/InputText/InputText";
import { useDailyTableContext } from "@/context/DailyTableContext";
import EditableHeader from "../../../ui/table/EditableHeader/EditableHeader";
import { errorToast } from "@/lib/toast";
import messages from "@/resources/messages";
import { COLOR_BY_TYPE } from "@/style/tableColors";
import { ColumnType } from "@/models/types/dailySchedule";

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

    const handleChange = (value: string) => {
        if (prevValue !== value.trim()) {
            populateEventColumn(columnId, value.trim());
            setPrevValue(value.trim());
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
                onBlur={(e) => handleChange(e.target.value)}
                defaultValue={selectedEventData || ""}
                backgroundColor="transparent"
                hasBorder={false}
            />
        </EditableHeader>
    );
};

export default DailyEventHeader;
