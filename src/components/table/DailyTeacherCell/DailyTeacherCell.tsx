import React, { useState, useMemo } from "react";
import styles from "./DailyTeacherCell.module.css";
import { useMainContext } from "@/context/MainContext";
import { useTableContext } from "@/context/TableContext";
import { CellContext } from "@tanstack/react-table";
import { TeacherRow } from "@/models/types/table";
import { createSelectOptions } from "@/utils/format";
import { useActions } from "@/context/ActionsContext";
import DynamicInputSelect from "@/components/ui/InputSelect/DynamicInputSelect";
import { ColumnType } from "@/models/types/dailySchedule";
import { errorToast, successToast } from "@/lib/toast";
import messages from "@/resources/messages";

type DailyTeacherCellProps = {
    cell?: CellContext<TeacherRow, unknown>;
    type: Exclude<ColumnType, "info">;
};

const DailyTeacherCell: React.FC<DailyTeacherCellProps> = ({ cell, type }) => {
    const { classes, subjects, teachers, school } = useMainContext();
    const { dailySchedule, selectedTeacherId, addNewSubTeacherCell } = useTableContext();
    const { selectedDayId } = useActions();
    const [isLoading, setIsLoading] = useState(false);
    const [selectedSubTeacher, setSelectedSubTeacher] = useState<string>("");

    console.log("cell", cell);

    // Get the current hour from the row data
    const hour = cell?.row?.original?.hour;

    // Get the column ID which contains the header ID
    const headerId = cell?.column?.id;

    // Get the schedule data for this cell
    const cellData = hour && headerId && dailySchedule[selectedDayId]?.[headerId]?.[String(hour)];

    // Find the class and subject based on their IDs
    const classData = useMemo(() => {
        if (cellData && "classId" in cellData && cellData.classId && classes) {
            return classes.find((c) => c.id === cellData.classId);
        }
        return undefined;
    }, [cellData, classes]);

    const subjectData = useMemo(() => {
        if (cellData && "subjectId" in cellData && cellData.subjectId && subjects) {
            return subjects.find((s) => s.id === cellData.subjectId);
        }
        return undefined;
    }, [cellData, subjects]);

    const handleTeacherChange = async (teacherId: string) => {
        if (!hour || !headerId || !selectedDayId) return;
        setIsLoading(true);
        setSelectedSubTeacher(teacherId);

        try {
            const response = await addNewSubTeacherCell(
                hour,
                headerId,
                selectedDayId,
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

    return selectedTeacherId ? (
        <div className={styles.cellContent}>
            {cellData && classData && subjectData ? (
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
    ) : (
        <div className={styles.cellContent}>
            <div className={styles.cellPlaceholder}>בחר מורה</div>
        </div>
    );
};

export default DailyTeacherCell;
