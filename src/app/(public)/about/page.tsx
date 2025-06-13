"use client";
import React from "react";
import { NextPage } from "next";
import { ActionBar } from "@/components/ActionBar";
import { TeacherTable } from "@/components/TeacherTable";
import { TeacherRow, ActionColumnType } from "@/models/types/table";
import { ColumnDef } from "@tanstack/react-table";
import styles from "./about.module.css";
import { Header } from "@/components/Header";

const initialData: TeacherRow[] = Array.from({ length: 8 }, (_, i) => ({ hour: i + 1 }));
const baseColumns: ColumnDef<TeacherRow>[] = [
    {
        accessorKey: "hour",
        header: "שעה",
        cell: (info: any) => <span>{info.getValue()}</span>,
        meta: { bgColor: "#f5f5f5" },
    },
];

const AboutPage: NextPage = () => {
    const [nextId, setNextId] = React.useState(1);
    const [actionCols, setActionCols] = React.useState<ColumnDef<TeacherRow>[]>([]);

    const handleSelect = (type: ActionColumnType) => {
        const id = `${type}-${nextId}`;
        setNextId((n) => n + 1);
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
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
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
                meta: { bgColor: "#f3e5f5" },
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
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
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
                meta: { bgColor: "#fff3e0" },
            };
        } else {
            col = {
                id,
                header: () => <div style={{ textAlign: "center" }}>מידע</div>,
                cell: () => <div style={{ textAlign: "center" }}>this is info</div>,
                meta: { bgColor: "#e8f5e9" },
            };
        }
        setActionCols((c) => [...c, col]);
    };
    const handleDelete = () => setActionCols((c) => c.slice(1));

    return (
        <div className={styles.pageContainer}>
            <Header />
            <div className={styles.content}>
                <ActionBar onSelect={handleSelect} onDelete={handleDelete} />
                <TeacherTable
                    data={initialData}
                    baseColumns={baseColumns}
                    actionColumns={actionCols}
                />
            </div>
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
