import React, { useMemo, useState } from "react";
import { useAnnualTable } from "@/context/AnnualTableContext";
import { getDayNameByDateString } from "@/utils/time";
import styles from "./DailyTeacherCell.module.css";
import { useMainContext } from "@/context/MainContext";
import { useDailyTableContext } from "@/context/DailyTableContext";
import { CellContext } from "@tanstack/react-table";
import { TeacherRow } from "@/models/types/table";
import { createSelectOptions } from "@/utils/format";
import DynamicInputGroupSelect from "@/components/ui/select/InputGroupSelect/DynamicInputGroupSelect";
import { ColumnType } from "@/models/types/dailySchedule";
import { errorToast, successToast } from "@/lib/toast";
import messages from "@/resources/messages";
import { sortTeachersForSchedule } from "@/utils/teachers";

type DailyTeacherCellProps = {
    cell: CellContext<TeacherRow, unknown>;
    type: Exclude<ColumnType, "event">;
};

const DailyTeacherCell: React.FC<DailyTeacherCellProps> = ({ cell, type }) => {
    const { teachers, classes } = useMainContext();
    const { dailySchedule, addNewCell, dailyScheduleRawData, selectedDate, updateCell } =
        useDailyTableContext();
    const [isLoading, setIsLoading] = useState(false);

    // Get the current hour, class, subject, subTeacher and headerCol from the row data
    const columnId = cell?.column?.id;
    const hour = cell?.row?.original?.hour.toString();
    const classData = dailySchedule[selectedDate]?.[columnId]?.[hour]?.class;
    const subjectData = dailySchedule[selectedDate]?.[columnId]?.[hour]?.subject;
    const subTeacherData = dailySchedule[selectedDate]?.[columnId]?.[hour]?.subTeacher;
    const headerData = dailySchedule[selectedDate]?.[columnId]?.[hour]?.headerCol;

    const [selectedSubTeacher, setSelectedSubTeacher] = useState<string>(subTeacherData?.id || "");

    const selectedClassId = classData?.id || "";
    const day = getDayNameByDateString(selectedDate);
    const sortedTeacherOptions = useMemo(
        () =>
            sortTeachersForSchedule(
                teachers || [],
                classes || [],
                {},
                selectedClassId,
                day,
                Number(hour),
            ),
        [teachers, classes, selectedClassId, day, hour],
    );

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
                    response = await updateCell(type, cellData, columnId, existingDailyEntry.id, {
                        subTeacher: newSubTeacherData,
                    });
                }
            } else {
                response = await addNewCell(type, cellData, columnId, {
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
                        <DynamicInputGroupSelect
                            options={sortedTeacherOptions}
                            value={selectedSubTeacher}
                            onChange={handleTeacherChange}
                            placeholder="בחירת מורה מחליף"
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
