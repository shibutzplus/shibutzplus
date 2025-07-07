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

    // Get the current hour, class, subject, subTeacher and headerTeacher from the row data
    const columnId = cell?.column?.id;
    const hour = cell?.row?.original?.hour.toString();
    const classData = dailySchedule[selectedDate]?.[columnId]?.[hour]?.class;
    const subjectData = dailySchedule[selectedDate]?.[columnId]?.[hour]?.subject;
    const subTeacherData = dailySchedule[selectedDate]?.[columnId]?.[hour]?.subTeacher;
    const headerTeacherData = dailySchedule[selectedDate]?.[columnId]?.[hour]?.headerTeacher;

    const [selectedSubTeacher, setSelectedSubTeacher] = useState<string>(subTeacherData?.id || "");

    const handleTeacherChange = async (teacherId: string) => {
        if (!hour || !columnId || !selectedDate || !headerTeacherData) return;
        setIsLoading(true);
        setSelectedSubTeacher(teacherId);

        try {
            const newSubTeacherData = teachers?.find((t) => t.id === teacherId);
            if (!newSubTeacherData) return;

            const cellData = dailySchedule[selectedDate]?.[columnId]?.[hour];
            if (!cellData) return;

            const response = await addNewSubTeacherCell(
                cellData,
                columnId,
                selectedDate,
                newSubTeacherData,
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
