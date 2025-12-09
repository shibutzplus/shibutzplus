"use client";

import React, { useState } from "react";
import styles from "./DebugTable.module.css";
import { FaTrash, FaChevronDown } from "react-icons/fa";
import InputSelect from "@/components/ui/select/InputSelect/InputSelect";
import { SelectOption } from "@/models/types";

const teacherOptions: SelectOption[] = Array.from({ length: 20 }, (_, i) => ({
    value: `teacher-${i + 1}`,
    label: `Teacher ${i + 1}`,
}));

const COLORS = {
    RED: 'RED',
    BLUE: 'BLUE',
    GREEN: 'GREEN'
};

const DebugTablePage = () => {
    // 10 grid rows
    const rows = Array.from({ length: 10 }, (_, i) => i);

    // Initial columns
    const [cols, setCols] = useState<number[]>([]);

    // Initialize colors
    const [colColors, setColColors] = useState<Record<number, string>>({});

    const [selectedTeachers, setSelectedTeachers] = useState<Record<number, string>>({});
    const [colWidths, setColWidths] = useState<Record<number, number>>({});

    const handleAddColoredColumn = (color: string) => {
        const newColId = Math.max(...cols, -1) + 1;

        // Start with 0 width
        setColWidths(prev => ({ ...prev, [newColId]: 0 }));

        let insertIndex = cols.length;
        for (let i = cols.length - 1; i >= 0; i--) {
            // Check if the column at this index has the same color
            if (colColors[cols[i]] === color) {
                insertIndex = i + 1;
                break;
            }
        }

        const newCols = [...cols];
        newCols.splice(insertIndex, 0, newColId);

        setCols(newCols);
        setColColors(prev => ({ ...prev, [newColId]: color }));

        let currentWidth = 0;
        const targetWidth = 180;
        const animDuration = 200;
        const fps = 60;
        const intervalTime = 1000 / fps;
        const step = targetWidth / (animDuration / intervalTime);

        const interval = setInterval(() => {
            currentWidth += step;

            if (currentWidth >= targetWidth) {
                currentWidth = targetWidth;
                clearInterval(interval);
                // Keep the final width or remove it to fallback to default (which is 180)
                // However, falling back might cause a jump if default is different or if re-render delays.
                // Safest to keep explicit width or delete if we trust default. 
                // Let's delete it so it falls back to the responsive default if we ever change it, 
                // OR matches the logic of 'removal' which relies on explicit width.
                // Actually, the render logic says `const width = colWidths[col] ?? defaultColWidth;`.
                // So deleting it is fine.
                setColWidths(prev => {
                    const next = { ...prev };
                    delete next[newColId];
                    return next;
                });
            } else {
                setColWidths(prev => ({ ...prev, [newColId]: currentWidth }));
            }
        }, intervalTime);
    };

    // Generic Add (preserves old behavior if needed, or we can remove it? User said "add 3 buttons", implying replacement or addition)
    // I'll keep the logic but maybe hide the button if not needed, but for now I'll just add the 3 specific ones.
    // Actually, I'll add the 3 specific buttons AND keep the generic one but maybe the generic one isn't needed if we have specific colors.
    // I'll replace the generic "Add Column" with the 3 colored ones as requested.

    const handleRemoveSpecificColumn = (colIdToRemove: number) => {
        if (!confirm("Are you sure you want to remove this column?")) return;

        let currentWidth = 180;
        setColWidths(prev => ({ ...prev, [colIdToRemove]: currentWidth }));

        const animDuration = 200;
        const fps = 60;
        const intervalTime = 1000 / fps;
        const step = 180 / (animDuration / intervalTime);

        const interval = setInterval(() => {
            currentWidth -= step;

            if (currentWidth <= 0) {
                currentWidth = 0;
                clearInterval(interval);

                setCols(prev => prev.filter(c => c !== colIdToRemove));

                setColColors(prev => {
                    const next = { ...prev };
                    delete next[colIdToRemove];
                    return next;
                });

                setColWidths(prev => {
                    const next = { ...prev };
                    delete next[colIdToRemove];
                    return next;
                });
            } else {
                setColWidths(prev => ({ ...prev, [colIdToRemove]: currentWidth }));
            }
        }, intervalTime);
    };

    const handleTeacherChange = (colId: number, value: string) => {
        setSelectedTeachers(prev => ({
            ...prev,
            [colId]: value
        }));
    };

    const defaultColWidth = 180;

    const getColorClass = (colorType: string) => {
        switch (colorType) {
            case COLORS.RED: return styles.headerRed;
            case COLORS.BLUE: return styles.headerBlue;
            case COLORS.GREEN: return styles.headerGreen;
            default: return styles.headerRed;
        }
    };

    return (
        <div className={styles.pageContainer}>
            <div className={styles.controls}>
                <button
                    className={`${styles.controlButton} ${styles.btnRed}`}
                    onClick={() => handleAddColoredColumn(COLORS.RED)}
                >
                    Add Red Column
                </button>
                <button
                    className={`${styles.controlButton} ${styles.btnBlue}`}
                    onClick={() => handleAddColoredColumn(COLORS.BLUE)}
                >
                    Add Blue Column
                </button>
                <button
                    className={`${styles.controlButton} ${styles.btnGreen}`}
                    onClick={() => handleAddColoredColumn(COLORS.GREEN)}
                >
                    Add Green Column
                </button>
            </div>

            <div className={styles.tableContainer}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th
                                className={`${styles.headerCell} ${styles.cornerCell}`}
                                style={{ width: "60px", minWidth: "60px", right: 0 }}
                            >
                                #
                            </th>

                            {cols.map((col) => {
                                const width = colWidths[col] ?? defaultColWidth;
                                const paddingInfo = width < 180
                                    ? { paddingLeft: 0, paddingRight: 0, padding: 0 }
                                    : { padding: 12 };
                                const colorType = colColors[col] || COLORS.RED; // Fallback
                                const headerColorClass = getColorClass(colorType);

                                return (
                                    <th
                                        key={col}
                                        className={`${styles.headerCell} ${headerColorClass}`}
                                        style={{
                                            width: `${width}px`,
                                            minWidth: `${width}px`,
                                            maxWidth: `${width}px`,
                                            ...paddingInfo,
                                            overflow: "hidden",
                                            transition: 'none',
                                        }}
                                    >
                                        <div className={styles.headerContentWrapper}>
                                            <div className={styles.inputSelectWrapper}>
                                                <InputSelect
                                                    options={teacherOptions}
                                                    value={selectedTeachers[col]}
                                                    onChange={(val) => handleTeacherChange(col, val)}
                                                    placeholder={`Teacher ${col + 1}`}
                                                    isClearable={false}
                                                    backgroundColor="rgba(255, 255, 255, 0.2)"
                                                    placeholderColor="white"
                                                    color="white"
                                                    fontSize="13px"
                                                    hasBorder={false}
                                                />
                                            </div>
                                            <FaTrash
                                                size={12}
                                                className={styles.trashIcon}
                                                onClick={() => handleRemoveSpecificColumn(col)}
                                            />
                                        </div>
                                    </th>
                                );
                            })}
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((row) => (
                            <tr key={row}>
                                <td
                                    className={`${styles.rowNumberCell}`}
                                    style={{ width: "60px", minWidth: "60px", right: 0 }}
                                >
                                    <div className={styles.rowNumberBadge}>
                                        {row + 1}
                                    </div>
                                </td>

                                {cols.map((col) => {
                                    const width = colWidths[col] ?? defaultColWidth;
                                    const paddingInfo = width < 180
                                        ? { paddingLeft: 0, paddingRight: 0, padding: 0 }
                                        : { padding: 12 };

                                    const colColor = colColors[col];
                                    const isBlue = colColor === COLORS.BLUE;

                                    return (
                                        <td
                                            key={`${row}-${col}`}
                                            className={styles.dataCell}
                                            style={{
                                                width: `${width}px`,
                                                minWidth: `${width}px`,
                                                maxWidth: `${width}px`,
                                                ...paddingInfo,
                                                overflow: "hidden",
                                                transition: 'none'
                                            }}
                                        >
                                            {isBlue ? (
                                                <textarea
                                                    rows={3}
                                                    className={styles.cellTextarea}
                                                />
                                            ) : (
                                                <div className={`${styles.cellContent} ${styles.cellContentInner}`}>
                                                    <div className={styles.cellHeader}>
                                                        <span>Class 5b</span>
                                                        <span style={{ fontSize: '10px' }}>Math</span>
                                                    </div>
                                                    <div className={styles.cellBody}>
                                                        Roni Pe'er
                                                    </div>
                                                    <div className={styles.cellFooter}>
                                                        <FaChevronDown size={10} />
                                                        <span>Substitute</span>
                                                    </div>
                                                </div>
                                            )}
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default DebugTablePage;
