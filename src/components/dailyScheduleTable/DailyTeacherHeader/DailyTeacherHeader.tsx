import React, { useState } from "react";
import DynamicInputSelect from "../../ui/InputSelect/DynamicInputSelect";
import { useDailyTableContext } from "@/context/DailyTableContext";
import { ColumnType } from "@/models/types/dailySchedule";
import { getDayNumberByDateString } from "@/utils/time";
import { useMainContext } from "@/context/MainContext";
import { errorToast, successToast } from "@/lib/toast";
import { createSelectOptions } from "@/utils/format";
import messages from "@/resources/messages";
import EditableHeader from "../../ui/table/EditableHeader/EditableHeader";

type DailyTeacherHeaderProps = {
    columnId: string;
    type: Exclude<ColumnType, "event">;
};

const DailyTeacherHeader: React.FC<DailyTeacherHeaderProps> = ({ columnId }) => {
    const { teachers } = useMainContext();
    const { dailySchedule, selectedDate, populateTeacherColumn } = useDailyTableContext();
    const [isLoading, setIsLoading] = useState(false);

    const selectedTeacherData =
        dailySchedule[selectedDate]?.[columnId]?.["1"]?.headerCol?.headerTeacher;

    const handleTeacherChange = async (value: string) => {
        const teacherId = value;
        if (teacherId) {
            setIsLoading(true);
            const dayNumber = getDayNumberByDateString(selectedDate);
            const response = await populateTeacherColumn(columnId, dayNumber, teacherId);
            if (response) {
                if (response.length === 0) {
                    successToast(messages.dailySchedule.noScheduleFound);
                } else {
                    successToast(messages.dailySchedule.success);
                }
            } else {
                errorToast(messages.dailySchedule.error);
            }
            setIsLoading(false);
        }
    };

    return (
        <EditableHeader columnId={columnId}>
            <DynamicInputSelect
                options={createSelectOptions(teachers)}
                value={selectedTeacherData?.id || ""}
                onChange={handleTeacherChange}
                placeholder="מורה"
                isSearchable
                isDisabled={isLoading}
                hasBorder
            />
        </EditableHeader>
    );
};

export default DailyTeacherHeader;
