import React, { useState } from "react";
import styles from "./DailyTeacherCell.module.css";
import { useMainContext } from "@/context/MainContext";
import { useDailyTableContext } from "@/context/DailyTableContext";
import { CellContext } from "@tanstack/react-table";
import { TeacherRow } from "@/models/types/table";
import { createSelectOptions } from "@/utils/format";
import { useTopNav } from "@/context/TopNavContext";
import DynamicInputSelect from "@/components/ui/InputSelect/DynamicInputSelect";
import { ColumnType } from "@/models/types/dailySchedule";
import { errorToast, successToast } from "@/lib/toast";
import messages from "@/resources/messages";

type DailyTeacherCellProps = {
    cell: CellContext<TeacherRow, unknown>;
    type: Exclude<ColumnType, "event">;
};

const DailyTeacherCell: React.FC<DailyTeacherCellProps> = ({ cell, type }) => {
    const { teachers } = useMainContext();
    const { dailySchedule, addNewCell, dailyScheduleRawData, updateSubTeacherCell } =
        useDailyTableContext();
    const { selectedDate } = useTopNav();
    const [isLoading, setIsLoading] = useState(false);

    // Get the current hour, class, subject, subTeacher and headerCol from the row data
    const columnId = cell?.column?.id;
    const hour = cell?.row?.original?.hour.toString();
    const classData = dailySchedule[selectedDate]?.[columnId]?.[hour]?.class;
    const subjectData = dailySchedule[selectedDate]?.[columnId]?.[hour]?.subject;
    const subTeacherData = dailySchedule[selectedDate]?.[columnId]?.[hour]?.subTeacher;
    const headerData = dailySchedule[selectedDate]?.[columnId]?.[hour]?.headerCol;

    const [selectedSubTeacher, setSelectedSubTeacher] = useState<string>(subTeacherData?.id || "");

    const handleTeacherChange = async (teacherId: string) => {
        if (!hour || !columnId || !selectedDate || !headerData) return;
        setIsLoading(true);
        setSelectedSubTeacher(teacherId);

        try {
            const newSubTeacherData = teachers?.find((t) => t.id === teacherId);
            if (!newSubTeacherData) return;

            const cellData = dailySchedule[selectedDate]?.[columnId]?.[hour];
            if (!cellData) return;

            let response;
            if (subTeacherData) {
                const existingDailyEntry = dailyScheduleRawData?.find(
                    (entry) =>
                        entry.columnId === columnId &&
                        entry.hour === Number(hour) &&
                        entry.subTeacher?.id === subTeacherData.id,
                );
                if (existingDailyEntry) {
                    response = await updateSubTeacherCell(
                        existingDailyEntry.id,
                        cellData,
                        columnId,
                        selectedDate,
                        newSubTeacherData,
                        type,
                    );
                }
            } else {
                response = await addNewCell(type, cellData, columnId, selectedDate, {
                    subTeacher: newSubTeacherData,
                });
            }

            if (response) {
                successToast(
                    subTeacherData
                        ? messages.dailySchedule.updateSuccess
                        : messages.dailySchedule.createSuccess,
                );
            } else {
                errorToast(
                    subTeacherData
                        ? messages.dailySchedule.updateError
                        : messages.dailySchedule.createError,
                );
                setSelectedSubTeacher("");
            }
        } catch (error) {
            console.error("Error handling daily schedule entry:", error);
            errorToast(
                subTeacherData
                    ? messages.dailySchedule.updateError
                    : messages.dailySchedule.createError,
            );
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
