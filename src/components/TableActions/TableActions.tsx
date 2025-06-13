"use client";

import React from "react";
import styles from "./TableActions.module.css";
import { useTableContext } from "@/context/TableContext";

type TableActionsProps = {
    hasPublish?: boolean;
    hasHistory?: boolean;
    hasMissingTeacher?: boolean;
    hasExistingTeacher?: boolean;
    hasInfo?: boolean;
    hasDelete?: boolean;
    hasDeleteRow?: boolean;
    hasMoveRow?: boolean;
};

const TableActions: React.FC<TableActionsProps> = ({
    hasPublish = true,
    hasHistory = true,
    hasMissingTeacher = true,
    hasExistingTeacher = true,
    hasInfo = true,
    hasDelete = true,
    hasDeleteRow = true,
    hasMoveRow = true,
}) => {
    const { addNewCol, removeCol } = useTableContext();

    return (
        <section className={styles.tableActions}>
            {hasPublish ? (
                <button
                    onClick={() => {}}
                    style={{ backgroundColor: "#FFC107" }}
                    className={styles.tableActionsBtn}
                >
                    פרסום
                </button>
            ) : null}
            {hasHistory ? (
                <button
                    onClick={() => {}}
                    style={{ backgroundColor: "#FFC107" }}
                    className={styles.tableActionsBtn}
                >
                    היסטוריה
                </button>
            ) : null}
            {hasMissingTeacher ? (
                <button
                    onClick={() => addNewCol("missingTeacher")}
                    style={{ backgroundColor: "#FFC107" }}
                    className={styles.tableActionsBtn}
                >
                    מורה חסר
                </button>
            ) : null}
            {hasExistingTeacher ? (
                <button
                    onClick={() => addNewCol("existingTeacher")}
                    style={{ backgroundColor: "#FFC107" }}
                    className={styles.tableActionsBtn}
                >
                    מורה קיים
                </button>
            ) : null}
            {hasInfo ? (
                <button
                    onClick={() => addNewCol("info")}
                    style={{ backgroundColor: "#FFC107" }}
                    className={styles.tableActionsBtn}
                >
                    מידע
                </button>
            ) : null}
            {hasDelete ? (
                <button
                    onClick={() => removeCol(1)}
                    style={{ backgroundColor: "#FFC107" }}
                    className={styles.tableActionsBtn}
                >
                    מחיקה
                </button>
            ) : null}
            {hasDeleteRow ? (
                <button
                    onClick={() => {}}
                    style={{ backgroundColor: "#FFC107" }}
                    className={styles.tableActionsBtn}
                >
                    מחיקת שורה
                </button>
            ) : null}
            {hasMoveRow ? (
                <button
                    onClick={() => {}}
                    style={{ backgroundColor: "#FFC107" }}
                    className={styles.tableActionsBtn}
                >
                    הזזת שורה
                </button>
            ) : null}
        </section>
    );
};

export default TableActions;
