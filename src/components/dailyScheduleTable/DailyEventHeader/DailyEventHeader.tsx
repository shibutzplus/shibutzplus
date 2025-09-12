import React, { useState } from "react";
import InputText from "../../ui/inputs/InputText/InputText";
import { useDailyTableContext } from "@/context/DailyTableContext";
import EditableHeader from "../../ui/table/EditableHeader/EditableHeader";

type DailyEventHeaderProps = {
    columnId: string;
};

const DailyEventHeader: React.FC<DailyEventHeaderProps> = ({ columnId }) => {
    const { populateEventColumn, mainDailyTable, selectedDate } = useDailyTableContext();
    
    const selectedEventData =
    mainDailyTable[selectedDate]?.[columnId]?.["1"]?.headerCol?.headerEvent;

    const [prevValue, setPrevValue] = useState<string>(selectedEventData || "");

    const handleChange = (value: string) => {
        if (prevValue !== value.trim()) {
            populateEventColumn(columnId, value.trim());
            setPrevValue(value.trim());
        }
    };

    return (
        <EditableHeader columnId={columnId} deleteLabel={selectedEventData || "האירוע"}>
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
