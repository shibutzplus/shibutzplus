import React from "react";
import styles from "./TableCell.module.css";
import { CellType } from "@/models/types/table";

type TableCellProps = {
    type: CellType;
};

const TableCell: React.FC<TableCellProps> = ({ type }) => {
    switch (type) {
        case "text":
            return <div style={{ textAlign: "center" }}>this is info</div>;
        case "select":
            return (
                <div className={styles.selectCellTd}>
                    <div className={styles.selectCellGrid}>
                        {/* Row 1: input | input | select */}
                        <input
                            type="text"
                            className={`${styles.selectCellInputClass} ${styles.selectCellInput1}`}
                        />
                        <input
                            type="text"
                            className={`${styles.selectCellInputName} ${styles.selectCellInput2}`}
                        />
                        <select
                            className={`${styles.selectCellSelect} ${styles.selectCellSelectRow1}`}
                        >
                            <option className={styles.selectCellOption} value="">
                                בחר
                            </option>
                            <option className={styles.selectCellOption} value="1">
                                1
                            </option>
                            <option className={styles.selectCellOption} value="2">
                                2
                            </option>
                        </select>

                        {/* Row 2: empty | empty | select */}
                        <select
                            className={`${styles.selectCellSelect} ${styles.selectCellSelectRow2}`}
                        >
                            <option className={styles.selectCellOption} value="">
                                בחר
                            </option>
                            <option className={styles.selectCellOption} value="1">
                                1
                            </option>
                            <option className={styles.selectCellOption} value="2">
                                2
                            </option>
                        </select>

                        {/* Row 3: empty | empty | select */}
                        <select
                            className={`${styles.selectCellSelect} ${styles.selectCellSelectRow3}`}
                        >
                            <option className={styles.selectCellOption} value="">
                                בחר
                            </option>
                            <option className={styles.selectCellOption} value="1">
                                1
                            </option>
                            <option className={styles.selectCellOption} value="2">
                                2
                            </option>
                        </select>
                    </div>
                </div>
            );
        case "split":
            return <div style={{ textAlign: "center" }}>this is info</div>;
        default:
            return null;
    }
};

export default TableCell;
