"use client";
import React from "react";
import { useReactTable, getCoreRowModel, flexRender, ColumnDef } from "@tanstack/react-table";
import { TeacherRow } from "@/models/types/table";

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
        <div style={{ flex: 1, overflow: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                    {table.getHeaderGroups().map((hg) => (
                        <tr key={hg.id}>
                            {hg.headers.map((header) => (
                                <th
                                    key={header.id}
                                    style={{
                                        border: "1px solid #ccc",
                                        padding: 8,
                                        background:
                                            (header.column.columnDef.meta as any)?.bgColor ||
                                            "#eee",
                                        textAlign:
                                            (header.column.columnDef.meta as any)?.align ||
                                            "center",
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
                                <td
                                    key={cell.id}
                                    style={{
                                        border: "1px solid #ddd",
                                        padding: 8,
                                        verticalAlign: "top",
                                    }}
                                >
                                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};
