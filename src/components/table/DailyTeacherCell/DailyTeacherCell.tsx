import React from "react";
import styles from "./DailyTeacherCell.module.css";
import DynamicInputTextSelect from "../../ui/InputTextSelect/DynamicInputTextSelect";
import { useMainContext } from "@/context/MainContext";
import { useTable } from "@/context/TableContext";
import { CellContext } from "@tanstack/react-table";
import { TeacherRow } from "@/models/types/table";
import { createSelectOptions } from "@/utils/format";
import { useActions } from "@/context/ActionsContext";

type DailyTeacherCellProps = {
    cell?: CellContext<TeacherRow, unknown>;
    type: "existing" | "missing";
}

const DailyTeacherCell: React.FC<DailyTeacherCellProps> = ({ cell, type }) => {
    const { classes, subjects, teachers } = useMainContext();
    const { dailySchedule, selectedTeacherId } = useTable();
    const { selectedDayId } = useActions();

    // Get the current hour from the row data
    const hour = cell?.row?.original?.hour;

    // Get the column ID which contains the header ID
    const headerId = cell?.column?.id;

    // Get the schedule data for this cell
    const cellData = hour && headerId && dailySchedule[selectedDayId]?.[headerId]?.[String(hour)];

    // Find the class and subject based on their IDs
    const classData =
        cellData && "classId" in cellData && cellData.classId
            ? classes?.find((c) => c.id === cellData.classId)
            : undefined;
    const subjectData =
        cellData && "subjectId" in cellData && cellData.subjectId
            ? subjects?.find((s) => s.id === cellData.subjectId)
            : undefined;

    return selectedTeacherId ? (
        <div className={styles.cellContent}>
            {cellData && classData && subjectData ? (
                <>
                    <div className={styles.classAndSubject}>
                        {cellData && classData && subjectData
                            ? `${classData.name} | ${subjectData.name}`
                            : ""}
                    </div>
                    <div className={styles.teacherSelect}>
                        <DynamicInputTextSelect
                            options={createSelectOptions(teachers)}
                            value=""
                            onChange={() => {}}
                            placeholder="בחר מורה"
                            isSearchable
                            hasBorder
                        />
                    </div>
                </>
            ) : (
                <div />
            )}
        </div>
    ) : (
        <div className={styles.cellContent}>
            <div className={styles.cellPlaceholder}>בחר מורה</div>
        </div>
    );
};

export default DailyTeacherCell;
