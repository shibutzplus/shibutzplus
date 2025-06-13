"use client"

import React from "react";
import styles from "./Table.module.css";
import ThTable from "@/components/table/ThTable/ThTable";
import TdTable from "@/components/table/TdTable/TdTable";
import ThTableSelect from "@/components/table/ThTableSelect/ThTableSelect";
import TdTableSelect from "@/components/table/TdTableSelect/TdTableSelect";
import { useTableContext } from "@/context/TableContext";
import { CellType, Colors } from "@/models/types/table";

type TableProps = {
    daysCount?: number;
};

const Table: React.FC<TableProps> = ({ daysCount = 7 }) => {
    const { cols } = useTableContext();
    
    // Generate array of days
    const days = Array.from({ length: daysCount }, (_, i) => i + 1);
    
    const renderHeader = (colType: CellType, color: Colors, index: number) => {
        switch (colType) {
            case "text":
                return <ThTable key={index} color={color} title="תכונה" />;
            case "select":
                return <ThTableSelect key={index} color={color} />;
            case "split":
                return <ThTable key={index} color={color} title="מידע מפוצל" />;
            default:
                return <th key={index}></th>;
        }
    };
    
    const renderCell = (cellType: CellType, content: string, color: Colors, rowIndex: number, colIndex: number) => {
        switch (cellType) {
            case "text":
                return <TdTable key={`${rowIndex}-${colIndex}`} text={content || ""} color={color} />;
            case "select":
                return <TdTableSelect key={`${rowIndex}-${colIndex}`} />;
            default:
                return <td key={`${rowIndex}-${colIndex}`}></td>;
        }
    };
    
    return (
        <table className={styles.dataTable}>
            <thead>
                <tr>
                    <th className={styles.thDays}>יום</th>
                    {cols.map((col, index) => renderHeader(col.type, col.color, index))}
                </tr>
            </thead>
            <tbody>
                {days.map((day, rowIndex) => (
                    <tr key={rowIndex}>
                        <td className={styles.tdDay}>{day}</td>
                        {cols.map((col, colIndex) => {
                            const cell = col.cells[rowIndex] || { type: col.type, content: "", id: 0 };
                            return renderCell(cell.type, cell.content, col.color, rowIndex, colIndex);
                        })}
                    </tr>
                ))}
            </tbody>
        </table>
    );
};

export default Table;
