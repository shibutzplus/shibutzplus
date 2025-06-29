import React from "react";
import styles from "./ExistingTeacherCell.module.css";
import DynamicInputSelect from "../../ui/InputSelect/DynamicInputSelect";
import { useMainContext } from "@/context/MainContext";
import { useTable } from "@/context/TableContext";
import { CellContext } from "@tanstack/react-table";
import { TeacherRow } from "@/models/types/table";

interface ExistingTeacherCellProps {
    cell?: CellContext<TeacherRow, unknown>;
}

const ExistingTeacherCell: React.FC<ExistingTeacherCellProps> = ({ cell }) => {
    const { classes, subjects } = useMainContext();
    const { state } = useTable();

    // Get the current hour from the row data
    const hour = cell?.row?.original?.hour;

    // Get the column ID which contains the header ID
    const headerId = cell?.column?.id;

    // Get the current day from the context
    const currentDay = state.currentDay;

    // Get the schedule data for this cell
    const cellData =
        hour && headerId && state.dailySchedule[currentDay]?.[headerId]?.[String(hour)];

    // Find the class and subject based on their IDs
    const classData =
        cellData && "classId" in cellData && cellData.classId
            ? classes?.find((c) => c.id === cellData.classId)
            : undefined;
    const subjectData =
        cellData && "subjectId" in cellData && cellData.subjectId
            ? subjects?.find((s) => s.id === cellData.subjectId)
            : undefined;

    return (
        <div className={styles.cellContent}>
            <div className={styles.classAndSubject}>
                {cellData && classData && subjectData
                    ? `${classData.name} | ${subjectData.name}`
                    : ""}
            </div>
            <div className={styles.teacherSelect}>
                <DynamicInputSelect
                    options={[]}
                    value=""
                    onChange={() => {}}
                    placeholder="בחר מורה"
                    isSearchable
                    hasBorder
                />
            </div>
        </div>
    );
};

export default ExistingTeacherCell;
