"use client";

import React from "react";
import styles from "./DailyFullScreenTable.module.css";
import { DailySchedule, ColumnType, ColumnTypeValues } from "@/models/types/dailySchedule";
import { sortDailyColumnIdsByPosition } from "@/utils/sort";
import { getCellDisplayData } from "@/utils/dailyCellDisplay";
import { COLOR_BY_TYPE } from "@/models/constant/daily";
import { calculateVisibleRowsForDaily } from "@/utils/tableUtils";
import { AppType } from "@/models/types";
import type { TeacherType } from "@/models/types/teachers";
import { successToast } from "@/lib/toast";

import { getCookie, setCookie, COOKIES_KEYS } from "@/lib/cookies";

type DailyFullScreenTableProps = {
    mainDailyTable: DailySchedule;
    selectedDate: string;
    fromHour?: number;
    toHour?: number;
    EmptyTable?: React.FC<{ date?: string; text?: string }>;
    appType?: AppType;
    onTeacherClick?: (teacher: TeacherType) => void;
    emptyText?: string;
};

const DailyFullScreenTable: React.FC<DailyFullScreenTableProps> = ({
    mainDailyTable,
    selectedDate,
    fromHour = 1,
    toHour = 10,
    EmptyTable,
    appType = "public",
    onTeacherClick,
    emptyText,
}) => {
    const schedule = mainDailyTable[selectedDate];
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
                Object.values(columnData).find((cell) => cell?.headerCol?.type !== undefined);

            types[colId] = colFirstObj?.headerCol?.type ?? ColumnTypeValues.event;
        });
        return types;
    }, [schedule, sortedTableColumns]);

    // Calculate visible rows
    const rows = React.useMemo(() => {
        return calculateVisibleRowsForDaily(
            schedule,
            sortedTableColumns,
            columnTypes,
            appType,
            fromHour,
            toHour
        );
    }, [schedule, sortedTableColumns, columnTypes, fromHour, toHour, appType]);

    const bodyRef = React.useRef<HTMLDivElement>(null);
    const [scrollbarWidth, setScrollbarWidth] = React.useState(0);

    React.useLayoutEffect(() => {
        const measureScrollbar = () => {
            if (bodyRef.current) {
                const width = bodyRef.current.offsetWidth - bodyRef.current.clientWidth;
                setScrollbarWidth(prev => prev !== width ? width : prev);
            }
        };

        measureScrollbar();
        window.addEventListener('resize', measureScrollbar);

        // Also measure when content might change (e.g. data load)
        const observer = new ResizeObserver(measureScrollbar);
        if (bodyRef.current) {
            observer.observe(bodyRef.current);
        }

        return () => {
            window.removeEventListener('resize', measureScrollbar);
            observer.disconnect();
        };
    }, []);

    const hasShownToast = React.useRef(false);

    React.useEffect(() => {
        const hasSeenToast = getCookie(COOKIES_KEYS.ROTATE_DEVICE_TOAST);

        if (!hasSeenToast && window.innerWidth < 500 && sortedTableColumns.length > 5 && !hasShownToast.current) {
            successToast("לצפייה מיטבית, מומלץ לסובב את המכשיר לרוחב. ", Infinity);
            setCookie(COOKIES_KEYS.ROTATE_DEVICE_TOAST, "true", { expires: 365 });
            hasShownToast.current = true;
        }
    }, [sortedTableColumns.length]);

    // Handle empty state
    if ((!schedule || Object.keys(schedule).length === 0) && EmptyTable) {
        return <EmptyTable date={selectedDate} text={emptyText} />;
    }

    // Determine Layout Classes based on column count
    const isFewCols = sortedTableColumns.length < 4;
    const isManyCols = sortedTableColumns.length > 8;

    const containerClasses = [
        styles.container,
        isFewCols ? styles.fewCols : "",
        isManyCols ? styles.manyCols : ""
    ].filter(Boolean).join(" ");

    const gridStyle = {
        "--num-cols": sortedTableColumns.length,
    } as React.CSSProperties;

    return (
        <div className={containerClasses}>
            {/* Header Row */}
            <div
                className={styles.headerRow}
                style={{
                    ...gridStyle,
                    paddingLeft: `${scrollbarWidth}px` // Add padding to compensate for scrollbar on the left (RTL)
                }}
            >
                <div className={styles.rowNumberHeader}></div>
                <div /> {/* 5px Spacer */}
                {sortedTableColumns.map((colId) => {
                    const type = columnTypes[colId] ?? ColumnTypeValues.event;
                    const column = schedule[colId];

                    // Determine header text
                    let headerText = "";
                    let headerTeacher: TeacherType | undefined;

                    if (type === ColumnTypeValues.event) {
                        const headerCell = Object.values(column).find(c => c?.headerCol?.headerEvent);
                        headerText = headerCell?.headerCol?.headerEvent || "אירוע";
                    } else {
                        const headerCell = Object.values(column).find(c => c?.headerCol?.headerTeacher);
                        headerText = headerCell?.headerCol?.headerTeacher?.name || "";
                        headerTeacher = headerCell?.headerCol?.headerTeacher;
                    }

                    const isClickable = !!onTeacherClick && type !== ColumnTypeValues.event && !!headerTeacher;

                    return (
                        <div
                            key={colId}
                            className={styles.headerCell}
                            style={{
                                backgroundColor: COLOR_BY_TYPE[type] || "#ccc",
                                cursor: isClickable ? "pointer" : "default"
                            }}
                            onClick={() => {
                                if (isClickable && headerTeacher && onTeacherClick) {
                                    onTeacherClick(headerTeacher);
                                }
                            }}
                        >
                            <div className={styles.headerContent}>
                                <span className={styles.headerText} title={headerText}>
                                    {headerText}
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Body Rows Container */}
            <div className={styles.bodyContainer} ref={bodyRef}>
                {rows.map((row) => (
                    <div key={row} className={styles.row} style={gridStyle}>
                        <div className={styles.rowNumberCell}>
                            {row}
                        </div>
                        <div className={styles.spacerCell} /> {/* 2px Spacer */}
                        {sortedTableColumns.map((colId) => {
                            const type = columnTypes[colId] ?? ColumnTypeValues.event;
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

                            if (type === ColumnTypeValues.event) {
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

export default DailyFullScreenTable;
