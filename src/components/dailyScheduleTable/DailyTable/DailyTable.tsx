"use client";

import React, { useState } from "react";
import styles from "./DailyTable.module.css";
import { useDailyTableContext } from "@/context/DailyTableContext";
import { flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { TeacherRow } from "@/models/types/table";
import { TableRows } from "@/models/constant/table";
import Icons from "@/style/icons";
import { HeaderColor, HourRowColor } from "@/style/tableColors";

const DailyTable: React.FC = () => {
    const { tableColumns } = useDailyTableContext();
    const [data] = useState<TeacherRow[]>(
        Array.from({ length: TableRows }, (_, i) => ({ hour: i + 1 })),
    );

    const baseCols = React.useMemo(
        () => [
            {
                accessorKey: "hour",
                header: "שעה",
                cell: (info: any) => <span className={styles.hourCell}>{info.getValue()}</span>,
                meta: { bgColor: HourRowColor },
            },
            {
                // Allow me to position fixed the hour col (use as a size under the hour column)
                accessorKey: "empty",
                header: "",
                cell: () => <span className={styles.empty}></span>,
            },
        ],
        [],
    );

    // If no columns except baseCols, add a single wide template column
    const hasExtraCols = tableColumns.length > 0;
    const baseEmpty = (id: string) => {
        return {
            id: id,
            header: () => (
                <span className={styles.templateHeaderText}>
                    לחצו על הכפתורים למעלה כדי להוסיף את השעות לפי מורה או מקצוע
                </span>
            ),
            cell: () => (
                <div className={styles.templateCell}>
                    <Icons.empty className={styles.templateIcon} size={18} />
                    <div className={styles.templateText}>אין נתונים להצגה</div>
                </div>
            ),
            meta: { bgColor: HeaderColor },
        };
    };
    const columns = React.useMemo(
        () => (hasExtraCols ? [...baseCols, ...tableColumns] : [...baseCols, baseEmpty("cell1")]),
        [baseCols, tableColumns],
    );
    const table = useReactTable({ data, columns, getCoreRowModel: getCoreRowModel() });

    return (
        <section className={styles.tableContainer}>
            <table className={styles.scheduleTable}>
                <thead>
                    {table.getHeaderGroups().map((hg) => (
                        <tr key={hg.id}>
                            {hg.headers.map((header) => (
                                <th
                                    key={header.id}
                                    className={
                                        header.column.id === "hour"
                                            ? styles.hourHeader
                                            : styles.dayHeader
                                    }
                                    style={
                                        header.column.id === "hour"
                                            ? { backgroundColor: HeaderColor }
                                            : {
                                                  background: (header.column.columnDef.meta as any)
                                                      ?.bgColor,
                                              }
                                    }
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
                    {table.getRowModel().rows.map((row, i) => (
                        <tr key={row.id} style={{ position: "relative" }}>
                            {row.getVisibleCells().map((cell) => (
                                <td
                                    key={cell.id}
                                    className={
                                        cell.column.id === "hour"
                                            ? styles.hourCell
                                            : cell.column.id === "empty"
                                              ? styles.empty
                                              : styles.scheduleCell
                                    }
                                    style={{ top: i*49 }}
                                >
                                    <div className={styles.cellContent}>
                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                    </div>
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </section>
    );
};

export default DailyTable;
