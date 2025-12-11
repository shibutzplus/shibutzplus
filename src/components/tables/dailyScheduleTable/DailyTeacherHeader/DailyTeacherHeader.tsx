import React, { useState, useMemo } from "react";
import { filterDailyHeaderTeachers } from "@/utils/sort";
import DynamicInputSelect from "../../../ui/select/InputSelect/DynamicInputSelect";
import { useDailyTableContext } from "@/context/DailyTableContext";
import { ColumnType } from "@/models/types/dailySchedule";
import { getDayNumberByDateString } from "@/utils/time";
import { useMainContext } from "@/context/MainContext";
import { errorToast, successToast } from "@/lib/toast";
import messages from "@/resources/messages";
import { BrightTextColor, BrightTextColorHover } from "@/style/root";
import { TeacherType } from "@/models/types/teachers";
import { useTeacherTableContext } from "@/context/TeacherTableContext";
import styles from "../DailyTable/DailyTable.module.css";
import useDeletePopup from "@/hooks/useDeletePopup";
import Icons from "@/style/icons";

type DailyTeacherHeaderProps = {
    columnId: string;
    type: ColumnType;
    onTeacherClick?: (teacher: TeacherType) => void;
    onDelete?: (colId: string) => void;
};

const DailyTeacherHeader: React.FC<DailyTeacherHeaderProps> = ({
    columnId,
    type,
    onTeacherClick,
    onDelete,
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
    const { handleOpenPopup } = useDeletePopup();

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
            selectedDate,
        );
    }, [teachers, mainDailyTable, selectedTeacherData, teachersTeachingTodayIds, selectedDate]);

    const handleDeleteColumn = async () => {
        const response = await deleteColumn(columnId);
        if (!response) {
            errorToast(messages.dailySchedule.deleteError);
        }
    };

    const handleDeleteClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        const label = selectedTeacherData?.name || "המורה";
        const msg = `האם למחוק את ${label}?`;

        if (onDelete) {
            handleOpenPopup("deleteDailyCol", msg, async () => onDelete(columnId));
        } else {
            handleOpenPopup("deleteDailyCol", msg, handleDeleteColumn);
        }
    };

    const handleTeacherClick = async () => {
        if (selectedTeacherData?.name && onTeacherClick) {
            onTeacherClick(selectedTeacherData);
            await fetchTeacherScheduleDate(selectedTeacherData, selectedDate);
        }
    };

    return (
        <div className={styles.headerContentWrapper}>
            <Icons.delete
                className={styles.trashIcon}
                onClick={handleDeleteClick}
                size={16}
                title="מחיקת עמודה"
            />
            <div className={styles.inputSelectWrapper}>
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
                    caretColor="#cccccc"
                />
            </div>
        </div>
    );
};

export default DailyTeacherHeader;

