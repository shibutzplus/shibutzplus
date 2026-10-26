"use client";

//
//  Used in Public Portal (school-changes-full) and Manager daily-build preview.
//  Displays the daily changes PER CLASS, omitting regular unchanged lessons and activity groups.
//

import React, { useMemo, useRef, useLayoutEffect, useState } from "react";
import { DailySchedule, ColumnType, ColumnTypeValues } from "@/models/types/dailySchedule";
import { sortClassNames, buildClassSchedule, calculateVisibleRowsForClasses } from "@/utils/dailyClassSchedule";
import { sortDailyColumnIdsByPosition } from "@/utils/sort";
import { COLOR_BY_TYPE, DEFAULT_GUARD_TITLE, DEFAULT_EVENT_TITLE } from "@/models/constant/daily";
import { getGuardCellDisplayData } from "@/utils/tableUtils";
import { ClassColor } from "@/style/root";
import { useOptionalMainContext } from "@/context/MainContext";
import { useOptionalPortalContext } from "@/context/PortalContext";
import { AppType } from "@/models/types";
import CommonDailySchoolFullEventCell from "../commonDailySchoolFull/CommonDailySchoolFullEventCell";
import CommonDailySchoolFullGuardCell from "../commonDailySchoolFull/CommonDailySchoolFullGuardCell";
import styles from "../commonDailySchoolFull/CommonDailySchoolFullTable.module.css";

type CommonDailyClassesFullTableProps = {
    mainDailyTable: DailySchedule;
    selectedDate: string;
    fromHour?: number;
    toHour?: number;
    EmptyTable?: React.FC<{ date?: string; text?: string }>;
    emptyText?: string;
    appType?: AppType;
};

const CommonDailyClassesFullTable: React.FC<CommonDailyClassesFullTableProps> = ({
    mainDailyTable,
    selectedDate,
    fromHour = 1,
    toHour = 10,
    EmptyTable,
    emptyText,
    appType = "private",
}) => {
    const schedule = mainDailyTable[selectedDate];
    const mainCtx = useOptionalMainContext();
    const portalCtx = useOptionalPortalContext();
    const dbClasses = mainCtx?.classes || portalCtx?.classes || [];
    const teachers = mainCtx?.teachers || portalCtx?.teachers || [];

    const teacherMap = useMemo(() => {
        const map = new Map<string, string>();
        teachers.forEach((t) => {
            if (t.id && t.name) {
                map.set(t.id, t.name);
            }
        });
        return map;
    }, [teachers]);

    // Build class-based schedule using shared utility (with complete dependencies)
    const classSchedule = useMemo(() => {
        return buildClassSchedule(schedule, dbClasses, appType);
    }, [schedule, dbClasses, appType]);

    // Sorted class names for columns (only classes with changes)
    const sortedClassNames = useMemo(() => {
        return sortClassNames(Object.keys(classSchedule));
    }, [classSchedule]);

    // Map column types once for the entire table
    const columnTypes = useMemo(() => {
        const types: Record<string, ColumnType> = {};
        if (!schedule) return types;

        Object.keys(schedule).forEach((colId) => {
            const columnData = schedule[colId];
            const colFirstObj =
                columnData?.["1"] ||
                Object.values(columnData || {}).find((cell) => cell?.headerCol?.type !== undefined);
            types[colId] = colFirstObj?.headerCol?.type ?? ColumnTypeValues.event;
        });

        return types;
    }, [schedule]);

    // Extract and sort event and guard columns from schedule
    const sortedEventColumnIds = useMemo(() => {
        if (!schedule) return [];
        const eventIds = Object.keys(schedule).filter((colId) => {
            const colType = columnTypes[colId] ?? ColumnTypeValues.event;
            return colType === ColumnTypeValues.event || colType === ColumnTypeValues.guard;
        });
        return sortDailyColumnIdsByPosition(eventIds, schedule);
    }, [schedule, columnTypes]);

    // Calculate visible rows using shared utility
    const rows = useMemo(() => {
        return calculateVisibleRowsForClasses(
            classSchedule,
            sortedClassNames,
            fromHour,
            toHour,
            schedule,
            sortedEventColumnIds
        );
    }, [classSchedule, sortedClassNames, fromHour, toHour, schedule, sortedEventColumnIds]);

    const bodyRef = useRef<HTMLDivElement>(null);
    const [scrollbarWidth, setScrollbarWidth] = useState(0);

    useLayoutEffect(() => {
        const measureScrollbar = () => {
            if (bodyRef.current) {
                const width = bodyRef.current.offsetWidth - bodyRef.current.clientWidth;
                setScrollbarWidth((prev) => (prev !== width ? width : prev));
            }
        };

        measureScrollbar();
        window.addEventListener("resize", measureScrollbar);

        const observer = new ResizeObserver(measureScrollbar);
        if (bodyRef.current) {
            observer.observe(bodyRef.current);
        }

        return () => {
            window.removeEventListener("resize", measureScrollbar);
            observer.disconnect();
        };
    }, []);

    // Handle empty state
    if (!schedule || (sortedClassNames.length === 0 && sortedEventColumnIds.length === 0)) {
        if (EmptyTable) {
            return <EmptyTable date={selectedDate} text={emptyText} />;
        }
        return null;
    }

    const totalCols = sortedClassNames.length + sortedEventColumnIds.length;
    const isFewCols = totalCols < 4;
    const isManyCols = totalCols > 8;

    const containerClasses = [
        styles.container,
        isFewCols ? styles.fewCols : "",
        isManyCols ? styles.manyCols : "",
    ]
        .filter(Boolean)
        .join(" ");

    const gridStyle = {
        "--num-cols": totalCols,
    } as React.CSSProperties;

    return (
        <div className={containerClasses}>
            {/* Header Row */}
            <div
                className={styles.headerRow}
                style={{
                    ...gridStyle,
                    paddingLeft: `${scrollbarWidth}px`,
                }}
            >
                <div className={styles.rowNumberHeader}></div>
                <div /> {/* 2px Spacer */}
                {sortedClassNames.map((className) => (
                    <div
                        key={className}
                        className={styles.headerCell}
                        style={{
                            backgroundColor: ClassColor,
                        }}
                    >
                        <div className={styles.headerContent}>
                            <span className={styles.headerText} title={className}>
                                {className}
                            </span>
                        </div>
                    </div>
                ))}
                {sortedEventColumnIds.map((colId) => {
                    const column = schedule[colId];
                    const colType = columnTypes[colId] ?? ColumnTypeValues.event;
                    const headerCell = column
                        ? Object.values(column).find((c) => c?.headerCol?.headerEvent)
                        : undefined;
                    const defaultHeaderText = colType === ColumnTypeValues.guard ? DEFAULT_GUARD_TITLE : DEFAULT_EVENT_TITLE;
                    const headerText = headerCell?.headerCol?.headerEvent || defaultHeaderText;

                    return (
                        <div
                            key={colId}
                            className={styles.headerCell}
                            style={{
                                backgroundColor: COLOR_BY_TYPE[colType] || "#48BB78",
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
                        <div className={styles.rowNumberCell}>{row}</div>
                        <div className={styles.spacerCell} />
                        {sortedClassNames.map((className) => {
                            const entries = classSchedule[className]?.[row] || [];
                            const isEmpty = entries.length === 0;

                            if (isEmpty) {
                                return <div key={`${className}-${row}`} className={styles.cell} />;
                            }

                            const isMissing = entries.some((e) => e.isMissing || e.teacherName === "אין ממלא מקום");
                            const teacherText = entries
                                .map((e) => e.teacherName)
                                .filter(Boolean)
                                .join(" / ");
                            const replacedTeachers = Array.from(
                                new Set(
                                    entries
                                        .filter((e) => e.originalTeacherName && e.originalTeacherName !== e.teacherName)
                                        .map((e) => e.originalTeacherName!.trim())
                                        .filter(Boolean)
                                )
                            );
                            const replacedTeacherText =
                                replacedTeachers.length > 0
                                    ? replacedTeachers.map((name) => `במקום ${name}`).join(" / ")
                                    : "";
                            const subjectText = entries
                                .map((e) => e.subjectName)
                                .filter(Boolean)
                                .join(" / ");

                            return (
                                <div key={`${className}-${row}`} className={styles.cell}>
                                    <div className={styles.cellContent}>
                                        {teacherText && (
                                            <span
                                                className={
                                                    isMissing ? styles.missingText : styles.subText
                                                }
                                            >
                                                {teacherText}
                                            </span>
                                        )}
                                        {replacedTeacherText && (
                                            <span className={styles.detailText}>
                                                {replacedTeacherText}
                                            </span>
                                        )}
                                        {subjectText && (
                                            <span className={styles.detailText}>
                                                {subjectText}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                        {sortedEventColumnIds.map((colId) => {
                            const columnData = schedule?.[colId];
                            const cellData = columnData?.[row];
                            const colType = columnTypes[colId] ?? ColumnTypeValues.event;

                            if (colType === ColumnTypeValues.guard) {
                                const { title, teachers: guardTeachers } = getGuardCellDisplayData(cellData, teacherMap);
                                const isEmpty = !title && guardTeachers.length === 0;

                                return (
                                    <div key={`${colId}-${row}`} className={styles.cell}>
                                        {!isEmpty && (
                                            <CommonDailySchoolFullGuardCell
                                                title={title}
                                                teachers={guardTeachers}
                                            />
                                        )}
                                    </div>
                                );
                            }

                            const eventText = cellData?.event;

                            return (
                                <div key={`${colId}-${row}`} className={styles.cell}>
                                    {eventText ? (
                                        <CommonDailySchoolFullEventCell eventText={eventText} />
                                    ) : null}
                                </div>
                            );
                        })}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CommonDailyClassesFullTable;
