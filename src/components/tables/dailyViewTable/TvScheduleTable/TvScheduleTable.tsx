"use client";

import React from "react";
import styles from "./TvScheduleTable.module.css";
import { DailySchedule, ColumnType } from "@/models/types/dailySchedule";
import { sortDailyColumnIdsByPosition } from "@/utils/sort";
import { getCellDisplayData } from "@/utils/dailyCellDisplay";
import { COLOR_BY_TYPE } from "@/models/constant/daily";
import { calculateVisibleRowsForDaily } from "@/utils/tableUtils";
import { AppType } from "@/models/types";
import { successToast } from "@/lib/toast";

type TvScheduleTableProps = {
    mainDailyTable: DailySchedule;
    selectedDate: string;
    hoursNum?: number;
    EmptyTable?: React.FC<{ date?: string }>;
    appType?: AppType;
};

const TvScheduleTable: React.FC<TvScheduleTableProps> = ({
    mainDailyTable,
    selectedDate,
    hoursNum = 8, // Default fallback
    EmptyTable,
    appType = "public",
}) => {
    const schedule = mainDailyTable[selectedDate];
    const colCount = schedule ? Object.keys(schedule).length : 0;
    const hasShownToast = React.useRef(false);

    React.useEffect(() => {
        if (window.innerWidth < 500 && colCount > 4 && !hasShownToast.current) {
            successToast("לצפייה מיטבית, מומלץ לסובב את המכשיר לרוחב. ", 2500);
            hasShownToast.current = true;
        }
    }, [colCount]);

    const tableColumns = React.useMemo(() => schedule ? Object.keys(schedule) : [], [schedule]);

    const sortedTableColumns = React.useMemo(() => {
        return schedule
            ? sortDailyColumnIdsByPosition(tableColumns, schedule)
            : [];
    }, [schedule, tableColumns]);

    // Map column types
    const columnTypes = React.useMemo(() => {
        const types: Record<string, ColumnType> = {};
        if (!schedule) return types;

        sortedTableColumns.forEach((colId) => {
            const columnData = schedule[colId];
            if (!columnData) return;

            const colFirstObj =
                columnData["1"] ||
                Object.values(columnData).find((cell) => cell?.headerCol?.type);

            types[colId] = colFirstObj?.headerCol?.type || "event";
        });
        return types;
    }, [schedule, sortedTableColumns]);

    // Calculate visible rows
    // Using schedule directly in dependency array ensures update on object reference change
    const rows = React.useMemo(() => {
        return calculateVisibleRowsForDaily(
            schedule,
            sortedTableColumns,
            columnTypes,
            appType,
            hoursNum
        );
    }, [schedule, sortedTableColumns, columnTypes, hoursNum, appType]);

    // Handle empty state
    if ((!schedule || Object.keys(schedule).length === 0) && EmptyTable) {
        return <EmptyTable date={selectedDate} />;
    }

    // Define grid columns style
    let colWidth: string;
    let fontSize: string;

    if (sortedTableColumns.length < 4) {
        // If less than 3 columns, limit width to avoid super wide columns
        // and increase font size for better readability
        colWidth = "20vw";
        fontSize = "1.8vw";
    } else {
        colWidth = "1fr";
        fontSize = "1.3vw";
    }

    const gridStyle = {
        "--num-cols": sortedTableColumns.length,
        "--col-width": colWidth,
        "--font-size": fontSize,
    } as React.CSSProperties;

    return (
        <div className={styles.container}>
            {/* Header Row */}
            <div className={styles.headerRow} style={gridStyle}>
                <div className={styles.rowNumberHeader}></div>
                <div /> {/* 5px Spacer */}
                {sortedTableColumns.map((colId) => {
                    const type = columnTypes[colId] || "event";
                    const column = schedule[colId];

                    // Determine header text
                    let headerText = "";
                    if (type === "event") {
                        const headerCell = Object.values(column).find(c => c?.headerCol?.headerEvent);
                        headerText = headerCell?.headerCol?.headerEvent || "אירוע";
                    } else {
                        const headerCell = Object.values(column).find(c => c?.headerCol?.headerTeacher);
                        headerText = headerCell?.headerCol?.headerTeacher?.name || "";
                    }

                    return (
                        <div
                            key={colId}
                            className={styles.headerCell}
                            style={{
                                backgroundColor: COLOR_BY_TYPE[type] || "#ccc",
                            }}
                        >
                            <div className={styles.headerContent}>
                                {headerText}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Body Rows Container */}
            <div className={styles.bodyContainer}>
                {rows.map((row) => (
                    <div key={row} className={styles.row} style={gridStyle}>
                        <div className={styles.rowNumberCell}>
                            {row}
                        </div>
                        <div className={styles.spacerCell} /> {/* 2px Spacer */}
                        {sortedTableColumns.map((colId) => {
                            const type = columnTypes[colId] || "event";
                            const columnData = schedule[colId];
                            const cellData = columnData?.[row];

                            let cellDisplay = {
                                main: "",
                                sub: "",
                                isMissing: false,
                                isEmpty: true,
                                isActivity: false,
                                isEvent: false
                            };

                            if (type === "event") {
                                const eventText = cellData?.event;
                                cellDisplay.isEmpty = !eventText;
                                cellDisplay.main = eventText || "";
                                cellDisplay.isEvent = true;
                            } else {
                                const { text, subTeacherName, isMissing, isEmpty, isActivity } = getCellDisplayData(cellData, type, appType);
                                cellDisplay = {
                                    main: text,
                                    sub: subTeacherName || "",
                                    isMissing,
                                    isEmpty,
                                    isActivity,
                                    isEvent: false
                                };
                            }

                            return (
                                <div key={`${colId}-${row}`} className={styles.cell}>
                                    {!cellDisplay.isEmpty && (
                                        <div className={`${styles.cellContent} ${cellDisplay.isActivity ? styles.activity : ""}`}>
                                            <span className={cellDisplay.isEvent ? styles.eventText : styles.mainText}>
                                                {cellDisplay.main}
                                            </span>
                                            {cellDisplay.sub && !cellDisplay.isEvent && <span className={styles.subText}>{cellDisplay.sub}</span>}
                                            {cellDisplay.isMissing && !cellDisplay.sub && <span className={styles.missingText}>אין ממלא מקום</span>}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TvScheduleTable;
