import React from "react";
import InputText from "../../ui/InputText/InputText";
import { useDailyTableContext } from "@/context/DailyTableContext";
import { useTopNav } from "@/context/TopNavContext";
import EditableHeader from "../../ui/table/EditableHeader/EditableHeader";

type DailyEventHeaderProps = {
    columnId: string;
};

const DailyEventHeader: React.FC<DailyEventHeaderProps> = ({ columnId }) => {
    const { populateEventColumn, dailySchedule } = useDailyTableContext();
    const { selectedDate } = useTopNav();

    const selectedEventData =
        dailySchedule[selectedDate]?.[columnId]?.["1"]?.headerCol?.headerEvent;

    const handleChange = (value: string) => {
        if (value.trim()) {
            populateEventColumn(columnId, value);
        }
    };

    return (
        <EditableHeader columnId={columnId}>
            <InputText
                placeholder="מידע"
                backgroundColor="transparent"
                onBlur={(e) => handleChange(e.target.value)}
                defaultValue={selectedEventData || ""}
            />
        </EditableHeader>
    );
};

export default DailyEventHeader;
