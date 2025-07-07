import React, { useState } from "react";
import styles from "./DailyTeacherHeader.module.css";
import DynamicInputSelect from "../../ui/InputSelect/DynamicInputSelect";
import { useMainContext } from "@/context/MainContext";
import { useDailyTableContext } from "@/context/DailyTableContext";
import { useActions } from "@/context/ActionsContext";
import { ColumnType } from "@/models/types/dailySchedule";
import messages from "@/resources/messages";
import { errorToast, successToast } from "@/lib/toast";
import { createSelectOptions } from "@/utils/format";
import { getDayNumberByDate } from "@/utils/time";

type DailyTeacherHeaderProps = {
    columnId: string;
    type: Exclude<ColumnType, "info">;
};

const DailyTeacherHeader: React.FC<DailyTeacherHeaderProps> = ({ columnId }) => {
    const { teachers } = useMainContext();
    const { dailySchedule, populateTeacherColumn, clearTeacherColumn } = useDailyTableContext();
    const { selectedDate } = useActions();
    const [isLoading, setIsLoading] = useState(false);

    // const selectedTeacherData = dailySchedule[selectedDate]?.[columnId]?.["1"]?.headerTeacher;
    const selectedTeacherData = dailySchedule[selectedDate]?.[columnId]?.["1"]?.headerTeacher; //TODO need to get the teacher from all the hours
    const selectedTeacherData1 = dailySchedule[selectedDate];
    // console.log("selectedTeacherData1", selectedTeacherData1);

    const handleTeacherChange = async (value: string) => {
        const teacherId = value;
        if (teacherId) {
            setIsLoading(true);
            const dayNumber = getDayNumberByDate(selectedDate);
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

    const handleClearColumn = () => {
        clearTeacherColumn(selectedDate, columnId);
    };

    return (
        <div className={styles.columnHeader}>
            <div>
                <button className={styles.clearButton} onClick={handleClearColumn}>
                    הסר
                </button>
            </div>
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
