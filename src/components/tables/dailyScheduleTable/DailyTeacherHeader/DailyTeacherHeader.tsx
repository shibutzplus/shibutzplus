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
import { BrightTextColor, BrightTextColorHover } from "@/style/root";
import { COLOR_BY_TYPE } from "@/models/constant/daily";
import { TeacherType } from "@/models/types/teachers";
import { useTeacherTableContext } from "@/context/TeacherTableContext";

type DailyTeacherHeaderProps = {
    columnId: string;
    type: ColumnType;
    onTeacherClick?: (teacher: TeacherType) => void;
};

const DailyTeacherHeader: React.FC<DailyTeacherHeaderProps> = ({
    columnId,
    type,
    onTeacherClick,
}) => {
    const { teachers } = useMainContext();
    const {
        mainDailyTable,
        selectedDate,
        populateTeacherColumn,
        deleteColumn,
        mapAvailableTeachers,
    } = useDailyTableContext();
    const { fetchTeacherScheduleDate } = useTeacherTableContext();
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

    // Build a set of teachers that actually teach today (in the annual schedule)
    const teachersTeachingTodayIds = useMemo(() => {
        const ids = new Set<string>();
        const dayNumber = getDayNumberByDateString(selectedDate);
        const dayMap = mapAvailableTeachers?.[dayNumber];
        if (!dayMap) return ids;

        Object.values(dayMap).forEach((hourTeachers) => {
            hourTeachers.forEach((id) => ids.add(id));
        });

        return ids;
    }, [mapAvailableTeachers, selectedDate]);

    // Filtered teacher options: only regular teachers, no duplicates, and only those teaching today
    const filteredTeacherOptions = useMemo(() => {
        return filterDailyHeaderTeachers(
            teachers,
            mainDailyTable,
            selectedTeacherData,
            teachersTeachingTodayIds,
        );
    }, [teachers, mainDailyTable, selectedTeacherData, teachersTeachingTodayIds]);

    const handleDeleteColumn = async () => {
        const response = await deleteColumn(columnId);
        if (!response) {
            errorToast(messages.dailySchedule.deleteError);
        }
    };

    const handleTeacherClick = async () => {
        if (selectedTeacherData?.name && onTeacherClick) {
            onTeacherClick(selectedTeacherData);
            await fetchTeacherScheduleDate(selectedTeacherData, selectedDate);
        }
    };

    return (
        <EditableHeader
            color={COLOR_BY_TYPE[type]}
            deleteLabel={selectedTeacherData?.name || "המורה"}
            deleteCol={handleDeleteColumn}
            onEyeClick={handleTeacherClick}
        >
            <DynamicInputSelect
                options={filteredTeacherOptions}
                value={selectedTeacherData?.id || ""}
                onChange={handleTeacherChange}
                placeholder="בחירת מורה"
                isSearchable
                isDisabled={isLoading}
                backgroundColor="transparent"
                color={BrightTextColor}
                colorHover={BrightTextColorHover}
                placeholderColor={BrightTextColor}
                fontSize="18px"
            />
        </EditableHeader>
    );
};

export default DailyTeacherHeader;
