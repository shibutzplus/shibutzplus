import React, { useState, useMemo } from "react";
import { filterDailyHeaderTeachers } from "@/utils/sort";
import DynamicInputSelect from "../../../ui/select/InputSelect/DynamicInputSelect";
import { useDailyTableContext } from "@/context/DailyTableContext";
import { ColumnType } from "@/models/types/dailySchedule";
import { getDayNumberByDateString } from "@/utils/time";
import { useMainContext } from "@/context/MainContext";
import { errorToast, successToast } from "@/lib/toast";
import messages from "@/resources/messages";
import EditableHeader from "../../../ui/table/EditableHeader/EditableHeader";
import { COLOR_BY_TYPE } from "@/style/tableColors";

type DailyTeacherHeaderProps = {
    columnId: string;
    type: ColumnType;
};

const DailyTeacherHeader: React.FC<DailyTeacherHeaderProps> = ({ columnId, type }) => {
    const { teachers } = useMainContext();
    const { mainDailyTable, selectedDate, populateTeacherColumn, deleteColumn } =
        useDailyTableContext();
    const [isLoading, setIsLoading] = useState(false);

    const selectedTeacherData =
        mainDailyTable[selectedDate]?.[columnId]?.["1"]?.headerCol?.headerTeacher;

    const handleTeacherChange = async (value: string) => {
        const teacherId = value;
        if (!teacherId) return;
        setIsLoading(true);
        const dayNumber = getDayNumberByDateString(selectedDate);
        const response = await populateTeacherColumn(
            selectedDate,
            columnId,
            dayNumber,
            teacherId,
            type,
        );
        if (response) {
            if (response.length === 0) {
                successToast(messages.dailySchedule.noScheduleFound);
            }
        } else {
            errorToast(messages.dailySchedule.error);
        }
        setIsLoading(false);
    };

    // filtered out teacher options that already selected
    // TODO: not efficient, need to check option to use session storage
    const filteredTeacherOptions = useMemo(() => {
        return filterDailyHeaderTeachers(teachers, mainDailyTable, selectedTeacherData);
    }, [teachers, mainDailyTable, selectedTeacherData]);

    const deleteCol = async () => {
        const response = await deleteColumn(columnId);
        if (!response) {
            errorToast(messages.dailySchedule.deleteError);
        }
    };

    return (
        <EditableHeader
            color={COLOR_BY_TYPE[type]}
            deleteLabel={selectedTeacherData?.name || "המורה"}
            deleteCol={deleteCol}
        >
            <DynamicInputSelect
                options={filteredTeacherOptions}
                value={selectedTeacherData?.id || ""}
                onChange={handleTeacherChange}
                placeholder="בחירת מורה"
                isSearchable
                isDisabled={isLoading}
                backgroundColor="transparent"
                color="#fff"
            />
        </EditableHeader>
    );
};

export default DailyTeacherHeader;
