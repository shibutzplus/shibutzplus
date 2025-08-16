import React, { useState } from "react";
import DynamicInputSelect from "../../ui/InputSelect/DynamicInputSelect";
import { useDailyTableContext } from "@/context/DailyTableContext";
import { ColumnType } from "@/models/types/dailySchedule";
import { getDayNumberByDateString } from "@/utils/time";
import { useMainContext } from "@/context/MainContext";
import { errorToast, successToast } from "@/lib/toast";
import { PopupAction } from "@/context/PopupContext";
import { createSelectOptions } from "@/utils/format";
import styles from "./DailyTeacherHeader.module.css";
import useDeletePopup from "@/hooks/useDeletePopup";
import { useTopNav } from "@/context/TopNavContext";
import messages from "@/resources/messages";

type DailyTeacherHeaderProps = {
    columnId: string;
    type: Exclude<ColumnType, "event">;
};

const DailyTeacherHeader: React.FC<DailyTeacherHeaderProps> = ({ columnId }) => {
    const { teachers } = useMainContext();
    const { dailySchedule, populateTeacherColumn, deleteColumn } = useDailyTableContext();
    const { selectedDate } = useTopNav();
    const { handleOpenPopup } = useDeletePopup();
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
                    successToast(messages.dailySchedule.retrieveSuccess);
                }
            } else {
                errorToast(messages.dailySchedule.retrieveError);
            }
            setIsLoading(false);
        }
    };

    const deleteCol = async () => {
        const response = await deleteColumn(columnId);
        if (response) {
            successToast(messages.dailySchedule.deleteSuccess);
        } else {
            errorToast(messages.dailySchedule.deleteError);
        }
    };

    const handleDeleteColumn = (e: React.MouseEvent) => {
        e.stopPropagation();
        handleOpenPopup(
            PopupAction.deleteDailyCol,
            `האם אתה בטוח שברצונך למחוק את השורה`,
            deleteCol,
        );
    };

    return (
        <div className={styles.columnHeader}>
            <button className={styles.clearButton} onClick={handleDeleteColumn}>
                הסר
            </button>
            <DynamicInputSelect
                options={createSelectOptions(teachers)}
                value={selectedTeacherData?.id || ""}
                onChange={handleTeacherChange}
                backgroundColor="transparent"
                placeholder="מורה"
                isSearchable
                isDisabled={isLoading}
                hasBorder
            />
        </div>
    );
};

export default DailyTeacherHeader;
