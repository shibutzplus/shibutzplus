import React from "react";
import styles from "./ReadOnlyDailyCell.module.css";
import { Cell, flexRender } from "@tanstack/react-table";
import { TeacherRow } from "@/models/types/table";

type ReadOnlyDailyCellProps = {
    cell: Cell<TeacherRow, unknown>;
};

const ReadOnlyDailyCell: React.FC<ReadOnlyDailyCellProps> = ({ cell }) => {
    return (
        <td className={cell.column.id === "hour" ? styles.hourCell : styles.scheduleCell}>
            <div className={styles.cellContent}>
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
            </div>
        </td>
    );
};

export default ReadOnlyDailyCell;
