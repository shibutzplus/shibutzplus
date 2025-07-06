import React, { useState } from "react";
import styles from "./DailyTeacherCell.module.css";
import { useMainContext } from "@/context/MainContext";
import { useDailyTableContext } from "@/context/DailyTableContext";
import { CellContext } from "@tanstack/react-table";
import { TeacherRow } from "@/models/types/table";
import { createSelectOptions } from "@/utils/format";
import { useActions } from "@/context/ActionsContext";
import DynamicInputSelect from "@/components/ui/InputSelect/DynamicInputSelect";
import { ColumnType } from "@/models/types/dailySchedule";
import { errorToast, successToast } from "@/lib/toast";
import messages from "@/resources/messages";

type DailyTeacherCellProps = {
    cell: CellContext<TeacherRow, unknown>;
    type: Exclude<ColumnType, "info">;
};

const DailyTeacherCell: React.FC<DailyTeacherCellProps> = ({ cell, type }) => {
    const { teachers } = useMainContext();
    const { dailySchedule, addNewSubTeacherCell } = useDailyTableContext();
    const { selectedDate } = useActions();
    const [isLoading, setIsLoading] = useState(false);

    // Get the current hour, class and subject from the row data
    const hour = cell?.row?.original?.hour;
    const classData = dailySchedule[selectedDate]?.[cell?.column?.id]?.[String(hour)]?.class;
    const subjectData = dailySchedule[selectedDate]?.[cell?.column?.id]?.[String(hour)]?.subject;
    const subTeacherData = dailySchedule[selectedDate]?.[cell?.column?.id]?.[String(hour)]?.subTeacher;

    const [selectedSubTeacher, setSelectedSubTeacher] = useState<string>(subTeacherData?.id || "");

    const handleTeacherChange = async (teacherId: string) => {
        // Get the column ID which contains the header ID
        const columnId = cell?.column?.id;
        if (!hour || !columnId || !selectedDate) return;
        setIsLoading(true);
        setSelectedSubTeacher(teacherId);

        try {
            const response = await addNewSubTeacherCell(
                hour,
                columnId,
                selectedDate,
                teacherId,
                type,
            );
            if (response) {
                successToast(messages.dailySchedule.createSuccess);
            } else {
                errorToast(messages.dailySchedule.createError);
                setSelectedSubTeacher("");
            }
        } catch (error) {
            console.error("Error adding daily schedule entry:", error);
            errorToast(messages.dailySchedule.createError);
            setSelectedSubTeacher("");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={styles.cellContent}>
            {classData && subjectData ? (
                <div className={styles.innerCellContent}>
                    <div className={styles.classAndSubject}>
                        {classData.name} | {subjectData.name}
                    </div>
                    <div className={styles.teacherSelect}>
                        <DynamicInputSelect
                            options={createSelectOptions(teachers)}
                            value={selectedSubTeacher}
                            onChange={handleTeacherChange}
                            placeholder="בחר מורה"
                            isSearchable
                            hasBorder
                            isDisabled={isLoading}
                        />
                    </div>
                </div>
            ) : (
                <div className={styles.emptyCell} />
            )}
        </div>
    );
};

export default DailyTeacherCell;
