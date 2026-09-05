"use client";

//
//  Used in History Page (private) and in School Schedule Portal (public).
//  Displays daily changes by teachers and events, with flip toggle to view changes PER CLASS.
//

import React, { useMemo, useState } from "react";
import { motion } from "motion/react";
import styles from "./CommonDailySchoolTable.module.css";
import { sortDailyColumnIdsByPosition } from "@/utils/sort";
import { calculateVisibleRowsForDaily } from "@/utils/tableUtils";
import { DailySchedule, ColumnType, ColumnTypeValues } from "@/models/types/dailySchedule";
import { AppType } from "@/models/types";
import { TeacherType } from "@/models/types/teachers";
import Icons from "@/style/icons";
import { useOptionalMainContext } from "@/context/MainContext";
import { useOptionalPortalContext } from "@/context/PortalContext";
import { sortClassNames, buildClassSchedule, calculateVisibleRowsForClasses, } from "@/utils/dailyClassSchedule";
import CommonDailySchoolTeacherHeader from "../CommonDailySchoolTeacherHeader/CommonDailySchoolTeacherHeader";
import CommonDailySchoolEventHeader from "../CommonDailySchoolEventHeader/CommonDailySchoolEventHeader";
import CommonDailySchoolTeacherCell from "../CommonDailySchoolTeacherCell/CommonDailySchoolTeacherCell";
import CommonDailySchoolEventCell from "../CommonDailySchoolEventCell/CommonDailySchoolEventCell";
import CommonDailySchoolClassHeader from "../CommonDailySchoolClassHeader/CommonDailySchoolClassHeader";
import CommonDailySchoolClassCell from "../CommonDailySchoolClassCell/CommonDailySchoolClassCell";

type CommonDailySchoolTableProps = {
    mainDailyTable: DailySchedule;
    selectedDate: string;
    onTeacherClick?: (teacher: TeacherType) => Promise<void>;
    appType?: AppType;
    EmptyTable?: React.FC<{ date?: string; text?: string }>;
    fromHour?: number;
    toHour?: number;
    emptyText?: string;
};

const CommonDailySchoolTable: React.FC<CommonDailySchoolTableProps> = ({
    mainDailyTable,
    selectedDate,
    onTeacherClick,
    EmptyTable,
    appType = "private",
    fromHour = 1,
    toHour = 10,
    emptyText,
}) => {
    const portalCtx = useOptionalPortalContext();
    const mainCtx = useOptionalMainContext();
    const dbClasses = mainCtx?.classes || portalCtx?.classes || [];

    const [internalViewType, setInternalViewType] = useState<"teachers" | "classes">("teachers");
    const currentViewType = portalCtx?.viewType || internalViewType;

    const handleSwitch = () => {
        if (portalCtx?.setViewType) {
            portalCtx.setViewType(currentViewType === "teachers" ? "classes" : "teachers");
        } else {
            setInternalViewType((prev) => (prev === "teachers" ? "classes" : "teachers"));
        }
    };

    const schedule = mainDailyTable[selectedDate];
    const tableColumns = schedule ? Object.keys(schedule) : [];
    const sortedTableColumns = schedule
        ? sortDailyColumnIdsByPosition(tableColumns, schedule)
        : [];

    const columnTypes = useMemo(() => {
        const types: Record<string, ColumnType> = {};
        if (!schedule) return types;

        sortedTableColumns.forEach((colId) => {
            const columnData = schedule[colId];
            if (!columnData) return;

            const colFirstObj = Object.values(columnData).find(
                (cell) => cell?.headerCol?.type !== undefined
            );

            types[colId] = colFirstObj?.headerCol?.type ?? ColumnTypeValues.event;
        });
        return types;
    }, [schedule, sortedTableColumns]);

    // Build class-based schedule using shared utility
    const classSchedule = useMemo(() => {
        return buildClassSchedule(schedule, dbClasses, appType);
    }, [schedule, dbClasses, appType]);

    const sortedClassNames = useMemo(() => {
        return sortClassNames(Object.keys(classSchedule));
    }, [classSchedule]);

    const hasClassChanges = sortedClassNames.length > 0;
    const isSwitched = currentViewType === "classes" && hasClassChanges;

    const sortedEventColumnIds = useMemo(() => {
        return sortedTableColumns.filter(
            (colId) => (columnTypes[colId] ?? ColumnTypeValues.event) === ColumnTypeValues.event
        );
    }, [sortedTableColumns, columnTypes]);

    // Calculate visible rows for teacher view
    const teacherRows = useMemo(() => {
        return calculateVisibleRowsForDaily(
            schedule,
            sortedTableColumns,
            columnTypes,
            appType,
            fromHour,
            toHour
        );
    }, [schedule, sortedTableColumns, columnTypes, fromHour, toHour, appType]);

    // Calculate visible rows for class view using shared utility
    const classRows = useMemo(() => {
        return calculateVisibleRowsForClasses(
            classSchedule,
            sortedClassNames,
            fromHour,
            toHour,
            schedule,
            sortedEventColumnIds
        );
    }, [classSchedule, sortedClassNames, fromHour, toHour, schedule, sortedEventColumnIds]);

    const activeRows = isSwitched ? classRows : teacherRows;

    const isEmpty = !schedule || Object.keys(schedule).length === 0;

    if (isEmpty && EmptyTable) {
        return <EmptyTable date={selectedDate} text={emptyText} />;
    }

    if (isEmpty) {
        return null;
    }

    return (
        <div className={styles.tableContainer}>
            <table className={styles.table}>
                <thead>
                    <tr>
                        {/* Corner Cell with 3D Flip Switch Button - only displayed if there are class changes */}
                        <th className={`${styles.headerCell} ${styles.cornerCell}`}>
                            <div className={`${styles.cornerInner} ${styles.headerGray}`}>
                                {hasClassChanges && (
                                    <button
                                        className={styles.switchButton}
                                        onClick={handleSwitch}
                                        title={
                                            isSwitched
                                                ? "מעבר לתצוגה לפי מורים"
                                                : "מעבר לתצוגה לפי כיתות"
                                        }
                                        aria-label="החלפת תצוגה"
                                    >
                                        <span
                                            className={`${styles.switchIcon} ${isSwitched ? styles.switchIconFlipped : ""
                                                }`}
                                        >
                                            <Icons.switchBold
                                                style={{ width: "20px", height: "20px" }}
                                            />
                                        </span>
                                    </button>
                                )}
                            </div>
                        </th>

                        {isSwitched ? (
                            <>
                                {sortedClassNames.map((className, index) => (
                                    <th
                                        key={className}
                                        className={`${styles.headerCell} ${styles.regularHeaderCell} ${styles.teacherHeaderCell}`}
                                    >
                                        <motion.div
                                            style={{ width: "100%", height: "100%" }}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ duration: 0.3, delay: index * 0.02 }}
                                        >
                                            <CommonDailySchoolClassHeader
                                                classNameText={className}
                                            />
                                        </motion.div>
                                    </th>
                                ))}
                                {sortedEventColumnIds.map((colId, index) => {
                                    const column = schedule[colId];
                                    return (
                                        <th
                                            key={colId}
                                            className={`${styles.headerCell} ${styles.regularHeaderCell} ${styles.eventHeaderCell}`}
                                        >
                                            <motion.div
                                                style={{ width: "100%", height: "100%" }}
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                transition={{
                                                    duration: 0.3,
                                                    delay: (sortedClassNames.length + index) * 0.02,
                                                }}
                                            >
                                                <CommonDailySchoolEventHeader
                                                    type={ColumnTypeValues.event}
                                                    column={column}
                                                    appType={appType}
                                                />
                                            </motion.div>
                                        </th>
                                    );
                                })}
                            </>
                        ) : (
                            sortedTableColumns.map((colId, index) => {
                                const type = columnTypes[colId] ?? ColumnTypeValues.event;
                                const column = schedule[colId];
                                const typeClass =
                                    type === ColumnTypeValues.event
                                        ? styles.eventHeaderCell
                                        : styles.teacherHeaderCell;

                                return (
                                    <th
                                        key={colId}
                                        className={`${styles.headerCell} ${styles.regularHeaderCell} ${typeClass}`}
                                    >
                                        <motion.div
                                            style={{ width: "100%", height: "100%" }}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ duration: 0.3, delay: index * 0.02 }}
                                        >
                                            {type === ColumnTypeValues.event ? (
                                                <CommonDailySchoolEventHeader
                                                    type={type}
                                                    column={column}
                                                    appType={appType}
                                                />
                                            ) : (
                                                <CommonDailySchoolTeacherHeader
                                                    column={column}
                                                    appType={appType}
                                                    type={type}
                                                    selectedDate={selectedDate}
                                                    onTeacherClick={onTeacherClick}
                                                />
                                            )}
                                        </motion.div>
                                    </th>
                                );
                            })
                        )}
                    </tr>
                </thead>
                <tbody>
                    {activeRows.map((row) => (
                        <tr key={row}>
                            <td className={styles.rowNumberCell}>
                                <div className={styles.rowNumberBadge}>{row}</div>
                            </td>

                            {isSwitched ? (
                                <>
                                    {sortedClassNames.map((className, index) => {
                                        const entries = classSchedule[className]?.[row];
                                        return (
                                            <td
                                                key={`${className}-${row}`}
                                                className={`${styles.dataCell} ${styles.regularDataCell} ${styles.teacherDataCell}`}
                                            >
                                                <motion.div
                                                    style={{ width: "100%", height: "100%" }}
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    transition={{
                                                        duration: 0.3,
                                                        delay: index * 0.02,
                                                    }}
                                                >
                                                    <CommonDailySchoolClassCell
                                                        entries={entries}
                                                    />
                                                </motion.div>
                                            </td>
                                        );
                                    })}
                                    {sortedEventColumnIds.map((colId, index) => {
                                        const columnData = schedule[colId];
                                        const cellData = columnData?.[row];

                                        return (
                                            <td
                                                key={`${colId}-${row}`}
                                                className={`${styles.dataCell} ${styles.regularDataCell} ${styles.eventDataCell}`}
                                            >
                                                <motion.div
                                                    style={{ width: "100%", height: "100%" }}
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    transition={{
                                                        duration: 0.3,
                                                        delay: (sortedClassNames.length + index) * 0.02,
                                                    }}
                                                >
                                                    <CommonDailySchoolEventCell
                                                        cell={cellData}
                                                        columnId={colId}
                                                    />
                                                </motion.div>
                                            </td>
                                        );
                                    })}
                                </>
                            ) : (
                                sortedTableColumns.map((colId, index) => {
                                    const type =
                                        columnTypes[colId] ?? ColumnTypeValues.event;
                                    const columnData = schedule[colId];
                                    const cellData = columnData?.[row];
                                    const typeClass =
                                        type === ColumnTypeValues.event
                                            ? styles.eventDataCell
                                            : styles.teacherDataCell;

                                    return (
                                        <td
                                            key={`${colId}-${row}`}
                                            className={`${styles.dataCell} ${styles.regularDataCell} ${typeClass}`}
                                        >
                                            <motion.div
                                                style={{ width: "100%", height: "100%" }}
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                transition={{
                                                    duration: 0.3,
                                                    delay: index * 0.02,
                                                }}
                                            >
                                                {type === ColumnTypeValues.event ? (
                                                    <CommonDailySchoolEventCell
                                                        cell={cellData}
                                                        columnId={colId}
                                                    />
                                                ) : (
                                                    <CommonDailySchoolTeacherCell
                                                        cell={cellData}
                                                        columnId={colId}
                                                        type={type}
                                                        appType={appType}
                                                    />
                                                )}
                                            </motion.div>
                                        </td>
                                    );
                                })
                            )}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default CommonDailySchoolTable;
