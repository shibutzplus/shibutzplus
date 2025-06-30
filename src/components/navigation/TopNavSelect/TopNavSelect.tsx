import React from "react";
import DynamicInputSelect from "../../ui/InputSelect/DynamicInputSelect";
import routePath from "../../../routes";
import { useActions } from "@/context/ActionsContext";

type TopNavSelectProps = {
    type: string | null;
};

const TopNavSelect: React.FC<TopNavSelectProps> = ({ type }) => {
    const {
        classesSelectOptions,
        daysSelectOptions,
        handleClassChange,
        handleDayChange,
        selectedClassId,
        selectedDayId,
    } = useActions();

    if (!type) return null;
    switch (type) {
        case routePath.dailySchedule.id:
            return (
                <DynamicInputSelect
                    options={daysSelectOptions()}
                    value={selectedDayId}
                    onChange={handleDayChange}
                    placeholder="בחר יום..."
                    hasBorder
                />
            );
        case routePath.annualSchedule.id:
            return (
                <DynamicInputSelect
                    options={classesSelectOptions()}
                    value={selectedClassId}
                    onChange={handleClassChange}
                    placeholder="בחר כיתה..."
                    hasBorder
                />
            );
        default:
            return null;
    }
};

export default TopNavSelect;
