"use client";
import React from "react";
import { useReactTable, getCoreRowModel, flexRender, ColumnDef } from "@tanstack/react-table";
import { TeacherRow } from "@/models/types/table";
import styles from "./TeacherTable.module.css";
interface TeacherTableProps {
    data: TeacherRow[];
    baseColumns: ColumnDef<TeacherRow>[];
    actionColumns: ColumnDef<TeacherRow>[];
}

export const TeacherTable: React.FC<TeacherTableProps> = ({ data, baseColumns, actionColumns }) => {
    const columns = React.useMemo(
        () => [...baseColumns, ...actionColumns],
        [baseColumns, actionColumns],
    );
    const table = useReactTable({ data, columns, getCoreRowModel: getCoreRowModel() });

    return (
        <div className={styles.container}>
            <div className={styles.tableWrapper}>
                <table className={styles.table}>
                    <thead>
                        {table.getHeaderGroups().map((hg) => (
                            <tr key={hg.id}>
                                {hg.headers.map((header) => (
                                    <th
                                        key={header.id}
                                        className={`${styles.headerCell} ${header.column.id === "hour" ? styles.hourCell : ""}`}
                                        style={{
                                            background: (header.column.columnDef.meta as any)?.bgColor,
                                        }}
                                    >
                                        {flexRender(
                                            header.column.columnDef.header,
                                            header.getContext(),
                                        )}
                                    </th>
                                ))}
                            </tr>
                        ))}
                    </thead>
                    <tbody>
                        {table.getRowModel().rows.map((row) => (
                            <tr key={row.id}>
                                {row.getVisibleCells().map((cell) => (
                                    <td key={cell.id} className={styles.cell}>
                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
