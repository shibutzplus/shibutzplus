"use client";

import React from "react";
import styles from "./Table.module.css";
import ThTable from "@/components/table/ThTable/ThTable";
import TdTable from "@/components/table/TdTable/TdTable";
import ThTableSelect from "@/components/table/ThTableSelect/ThTableSelect";
import TdTableSelect from "@/components/table/TdTableSelect/TdTableSelect";
import { useTableContext } from "@/context/TableContext";
import { TableAction } from "@/models/types/table";
import TdTableSplit from "../TdTableSplit/TdTableSplit";
import { TableRows } from "@/models/constant/table";

type TableProps = {
    daysCount?: number;
};

const Table: React.FC<TableProps> = ({ daysCount = TableRows }) => {
    const { cols } = useTableContext();

    // Generate array of days
    const days = Array.from({ length: daysCount }, (_, i) => i + 1);

    const renderHeader = (action: TableAction, index: number) => {
        switch (action) {
            case "missingTeacher":
                return <ThTableSelect key={index} color="red" />;
            case "existingTeacher":
                return <ThTableSelect key={index} color="yellow" />;
            case "info":
                return <ThTable key={index} color="green" title="מידע מפוצל" />;
            default:
                return <th key={index}></th>;
        }
    };

    const renderCell = (
        action: TableAction,
        content: string,
        rowIndex: number,
        colIndex: number,
    ) => {
        switch (action) {
            case "missingTeacher":
                return <TdTableSelect key={`${action}-${rowIndex}-${colIndex}`} />;
            case "existingTeacher":
                return <TdTable key={`${action}-${rowIndex}-${colIndex}`} text={content} />;
                // return <TdTableSplit key={`${action}-${rowIndex}-${colIndex}`} text={content} />;
            case "info":
                return <TdTable key={`${action}-${rowIndex}-${colIndex}`} text={content} />;
            default:
                return <td key={`${action}-${rowIndex}-${colIndex}`}></td>;
        }
    };

    return (
        <table className={styles.dataTable}>
            <thead>
                <tr>
                    <th className={styles.thDays}>יום</th>
                    {cols.map((col, index) => renderHeader(col.action, index))}
                </tr>
            </thead>
            <tbody>
                {days.map((day, rowIndex) => (
                    <tr key={rowIndex}>
                        <td className={styles.tdDay}>{day}</td>
                        {cols.map((col, colIndex) => {
                            const cell = col.cells[rowIndex]
                            return renderCell(col.action, cell.content, rowIndex, colIndex);
                        })}
                    </tr>
                ))}
            </tbody>
        </table>
    );
};

export default Table;
