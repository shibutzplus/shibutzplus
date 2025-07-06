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

type DailyTeacherHeaderProps = {
    columnId?: string;
    type: Exclude<ColumnType, "info">;
};

const DailyTeacherHeader: React.FC<DailyTeacherHeaderProps> = ({ columnId, type }) => {
    const { teachers, school } = useMainContext();
    const { populateTeacherColumn } = useDailyTableContext();
    const { selectedDate } = useActions();
    const [selectedTeacherId, setSelectedTeacherId] = useState<string>("");
    const [isLoading, setIsLoading] = useState(false);

    const handleTeacherChange = async (value: string) => {
        if (!school?.id || !columnId) return;
        const teacherId = value;
        if (teacherId) {
            setIsLoading(true);
            setSelectedTeacherId(teacherId);
            const dayNumber = 1; /////TODO
            const response = await populateTeacherColumn(
                selectedDate,
                columnId,
                school.id,
                dayNumber,
                teacherId,
            );
            if (response) {
                successToast(messages.dailySchedule.retrieveSuccess);
            } else {
                errorToast(messages.dailySchedule.retrieveError);
            }
            setIsLoading(false);
        }
    };

    return (
        <div className={styles.columnHeader}>
            <DynamicInputSelect
                options={createSelectOptions(teachers)}
                value={selectedTeacherId}
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
