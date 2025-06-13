"use client";
import React from "react";
import { NextPage } from "next";
import { ActionBar } from "@/components/ActionBar";
import { TeacherTable } from "@/components/TeacherTable";
import { TeacherRow, ActionColumnType } from "@/models/types/table";
import { ColumnDef } from "@tanstack/react-table";

// Initial rows: only hours
const initialData: TeacherRow[] = Array.from({ length: 7 }, (_, i) => ({ hour: i + 1 }));

const baseColumns: ColumnDef<TeacherRow>[] = [
    {
        accessorKey: "hour",
        header: "שעה",
        cell: (info: any) => <span>{info.getValue()}</span>,
        meta: { bgColor: "#fff", align: "center" },
    },
];

const AboutPage: NextPage = () => {
    // Global unique counter for all new columns
    const [nextId, setNextId] = React.useState(1);
    const [actionCols, setActionCols] = React.useState<ColumnDef<TeacherRow>[]>([]);

    const handleSelect = (type: ActionColumnType) => {
        // Assign and increment a global ID to guarantee uniqueness
        const id = `${type}-${nextId}`;
        setNextId((prev) => prev + 1);

        let col: ColumnDef<TeacherRow>;
        if (type === "missingTeacher") {
            col = {
                id,
                header: () => (
                    <select>
                        <option>בחירה 1</option>
                        <option>בחירה 2</option>
                    </select>
                ),
                cell: () => (
                    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                        <input placeholder="שדה 1" />
                        <input placeholder="שדה 2" />
                        <select>
                            <option>א</option>
                        </select>
                        <select>
                            <option>ב</option>
                        </select>
                        <select>
                            <option>ג</option>
                        </select>
                    </div>
                ),
                meta: { bgColor: "#d0f0c0" },
            };
        } else if (type === "existingTeacher") {
            col = {
                id,
                header: () => (
                    <select>
                        <option>אפשרות A</option>
                        <option>אפשרות B</option>
                    </select>
                ),
                cell: () => (
                    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                        <input placeholder="שדה 1" />
                        <input placeholder="שדה 2" />
                        <select>
                            <option>X</option>
                        </select>
                        <select>
                            <option>Y</option>
                        </select>
                        <select>
                            <option>Z</option>
                        </select>
                    </div>
                ),
                meta: { bgColor: "#f8d7da" },
            };
        } else {
            col = {
                id,
                header: () => <div style={{ textAlign: "center" }}>info</div>,
                cell: () => <div style={{ textAlign: "center" }}>this is info</div>,
                meta: { bgColor: "#cce5ff", align: "center" },
            };
        }

        setActionCols((prev) => [...prev, col]);
    };

    const handleDelete = () => setActionCols((prev) => prev.slice(1));

    return (
        <div style={{ display: "flex", height: "100vh" }}>
            <ActionBar onSelect={handleSelect} onDelete={handleDelete} />
            <TeacherTable data={initialData} baseColumns={baseColumns} actionColumns={actionCols} />
        </div>
    );
};

export default AboutPage;

{
    /* <main className={styles.container}>
<section className={styles.tableWrapper}>
    <TableContextProvider>
        <TableActions />
        <Table />
    </TableContextProvider>
</section>
</main> */
}
