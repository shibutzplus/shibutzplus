import React, { useState } from "react";
import DynamicInputSelect from "../../ui/select/InputSelect/DynamicInputSelect";
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

const DailyTeacherHeader: React.FC<DailyTeacherHeaderProps> = ({ columnId, type }) => {
    const { teachers } = useMainContext();
    const { mainDailyTable, selectedDate, populateTeacherColumn } = useDailyTableContext();
    const [isLoading, setIsLoading] = useState(false);

    const selectedTeacherData =
        mainDailyTable[selectedDate]?.[columnId]?.["1"]?.headerCol?.headerTeacher;

    // Always use the teacher name for delete popup
    const deleteLabel = selectedTeacherData?.name || "המורה";

    const handleTeacherChange = async (value: string) => {
        const teacherId = value;
        if (!teacherId) return;
        setIsLoading(true);
        const dayNumber = getDayNumberByDateString(selectedDate);
        const response = await populateTeacherColumn(columnId, dayNumber, teacherId, type);
        if (response) {
            if (response.length === 0) {
                successToast(messages.dailySchedule.noScheduleFound);
            }
        } else {
            errorToast(messages.dailySchedule.error);
        }
        setIsLoading(false);
    };

    return (
        <EditableHeader columnId={columnId} deleteLabel={deleteLabel}>
            <DynamicInputSelect
                options={createSelectOptions(teachers)}
                value={selectedTeacherData?.id || ""}
                onChange={handleTeacherChange}
                placeholder="בחירת מורה"
                isSearchable
                isDisabled={isLoading}
                backgroundColor="transparent"
            />
        </EditableHeader>
    );
};

export default DailyTeacherHeader;