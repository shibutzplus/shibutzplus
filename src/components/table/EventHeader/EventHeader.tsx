import React from "react";
import InputText from "../../ui/InputText/InputText";
import { useDailyTableContext } from "@/context/DailyTableContext";
import { useTopNav } from "@/context/TopNavContext";
import ColHeader from "../ColHeader/ColHeader";

type EventHeaderProps = {
    columnId: string;
};

const EventHeader: React.FC<EventHeaderProps> = ({ columnId }) => {
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
        <ColHeader columnId={columnId}>
            <InputText
                placeholder="מידע"
                backgroundColor="transparent"
                onBlur={(e) => handleChange(e.target.value)}
                defaultValue={selectedEventData || ""}
            />
        </ColHeader>
    );
};

export default EventHeader;
