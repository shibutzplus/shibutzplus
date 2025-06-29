import React from "react";
import styles from "./MissingTeacherCell.module.css";
import { useMainContext } from "@/context/MainContext";
import { useTable } from "@/context/TableContext";
import { CellContext } from "@tanstack/react-table";
import { TeacherRow } from "@/models/types/table";
import DynamicInputSelect from "@/components/ui/InputSelect/DynamicInputSelect";

interface MissingTeacherCellProps {
    cell: CellContext<TeacherRow, unknown>;
}

const MissingTeacherCell: React.FC<MissingTeacherCellProps> = ({ cell }) => {
    const { classes, subjects } = useMainContext();
    const { currentDay, dailySchedule } = useTable();

    // Get the current hour from the row data
    const hour = cell.row.original.hour;

    // Get the column ID which contains the header ID
    const headerId = cell.column.id;

    // Get the schedule data for this cell
    const cellData = dailySchedule[currentDay]?.[headerId]?.[String(hour)];

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

export default MissingTeacherCell;
