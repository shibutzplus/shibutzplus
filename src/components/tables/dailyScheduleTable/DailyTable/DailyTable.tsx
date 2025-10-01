"use client";

import React, { useState } from "react";
import { flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { useDailyTableContext } from "@/context/DailyTableContext";
import { TeacherRow } from "@/models/types/table";
import { TableRows } from "@/models/constant/table";
import { HeaderColor } from "@/style/tableColors";
import styles from "./DailyTable.module.css";

const DailyTable: React.FC = () => {
    const { tableColumns } = useDailyTableContext();
    const [data] = useState<TeacherRow[]>(
        Array.from({ length: TableRows }, (_, i) => ({ hour: i + 1 })),
    );

    const hasExtraCols = tableColumns.length > 0;
    const baseEmpty = (id: string) => {
        return {
            id: id,
            header: () => (
                <span className={styles.templateHeaderText}>
                    יש ללחוץ על כפתורי השיבוץ כדי לעדכן מערכת יומית
                </span>
            ),
            cell: () => (
                <div className={styles.templateCell}>
                    <div className={styles.templateText}>אין שינוי במערכת היומית</div>
                </div>
            ),
            meta: { bgColor: HeaderColor },
        };
    };
    const columns = React.useMemo(
        () => (hasExtraCols ? [...tableColumns] : [baseEmpty("cell1")]),
        [tableColumns],
    );
    const table = useReactTable({ data, columns, getCoreRowModel: getCoreRowModel() });

    return (
        <section className={styles.tableContainer}>
            <div className={styles.fixedHourColumn}>
                <div className={styles.hourHeader} style={{ backgroundColor: HeaderColor }}>
                    {/* שעה */}
                </div>
                {data.map((_, i) => (
                    <div key={i} className={styles.hourCell}>
                        {i + 1}
                    </div>
                ))}
            </div>

            <div className={`${styles.scrollableContent} daily-scrollable`}>
                <table className={styles.scheduleTable}>
                    <thead>
                        {table.getHeaderGroups().map((hg) => (
                            <tr key={hg.id}>
                                {hg.headers.map((header) => (
                                    <th
                                        key={header.id}
                                        className={styles.colHeader}
                                        style={{
                                            background: (header.column.columnDef.meta as any)
                                                ?.bgColor,
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
                                        className={
                                            cell.column.id === "empty"
                                                ? styles.empty
                                                : styles.scheduleCell
                                        }
                                    >
                                        <div className={styles.cellContent}>
                                            {flexRender(
                                                cell.column.columnDef.cell,
                                                cell.getContext(),
                                            )}
                                        </div>
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </section>
    );
};

export default DailyTable;
