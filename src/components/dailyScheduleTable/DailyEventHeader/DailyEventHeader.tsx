import React from "react";
import InputText from "../../ui/InputText/InputText";
import { useDailyTableContext } from "@/context/DailyTableContext";
import EditableHeader from "../../ui/table/EditableHeader/EditableHeader";

type DailyEventHeaderProps = {
    columnId: string;
};

const DailyEventHeader: React.FC<DailyEventHeaderProps> = ({ columnId }) => {
    const { populateEventColumn, mainDailyTable, selectedDate } = useDailyTableContext();

    const selectedEventData =
        mainDailyTable[selectedDate]?.[columnId]?.["1"]?.headerCol?.headerEvent;

    const handleChange = (value: string) => {
        if (value.trim()) {
            populateEventColumn(columnId, value);
        }
    };

    return (
        <EditableHeader columnId={columnId}>
            <InputText
                placeholder="מידע"
                onBlur={(e) => handleChange(e.target.value)}
                defaultValue={selectedEventData || ""}
                backgroundColor="transparent"
            />
        </EditableHeader>
    );
};

export default DailyEventHeader;
