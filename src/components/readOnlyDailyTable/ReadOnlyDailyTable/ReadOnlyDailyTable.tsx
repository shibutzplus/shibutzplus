"use client";

import React, { useMemo } from "react";
import styles from "./ReadOnlyDailyTable.module.css";
import { TableRows } from "@/models/constant/table";
import { DailyScheduleType } from "@/models/types/dailySchedule";
import ReadOnlyDailyHeader from "../ReadOnlyDailyHeader/ReadOnlyDailyHeader";
import ReadOnlyTeacherCell from "../ReadOnlyTeacherCell/ReadOnlyTeacherCell";
import ReadOnlyEventCell from "../ReadOnlyEventCell/ReadOnlyEventCell";
import { getHeaderItems, sortAndGroupScheduleData } from "@/services/portalDailyScheduleService";

interface ReadOnlyDailyTableProps {
    scheduleData: DailyScheduleType[];
    isLoading: boolean;
    hasMobileNav?: boolean;
}

const ReadOnlyDailyTable: React.FC<ReadOnlyDailyTableProps> = ({
    scheduleData,
    isLoading,
    hasMobileNav = false,
}) => {
    const hasData = Array.isArray(scheduleData) && scheduleData.length > 0;

    if (!hasData && !isLoading)
        return (
            <div className={styles.noDataMessage}>
                אין נתונים להצגה <br /> לא פורסמה מערכת ליום זה
            </div>
        );

    const scheduleByColumn = React.useMemo(() => {
        if (!hasData) return {};
        return sortAndGroupScheduleData(scheduleData);
    }, [scheduleData, hasData]);

    const headerItems = useMemo(() => {
        return getHeaderItems(scheduleByColumn);
    }, [scheduleByColumn]);

    const columnIds = useMemo(() => Object.keys(scheduleByColumn), [scheduleByColumn]);
    const hours = useMemo(() => Array.from({ length: TableRows }, (_, i) => i + 1), []);

    const renderCell = (columnId: string, hour: number) => {
        const cellData = scheduleByColumn[columnId]?.[hour];
        if (!cellData) return <div className={styles.emptyCell}></div>;
        if (cellData.issueTeacherType === "event" && cellData.event)
            return <ReadOnlyEventCell cellData={cellData} />;
        return <ReadOnlyTeacherCell cellData={cellData} />;
    };

    return (
        <section
            className={`${styles.tableContainer} ${hasMobileNav ? styles.withMobileNav : ""}`}
            aria-label="טבלת מערכת יומית"
        >
            <table className={styles.scheduleTable}>
                <ReadOnlyDailyHeader items={headerItems} />
                <tbody>
                    {hours.map((hour) => (
                        <tr key={hour}>
                            <td className={styles.hourCell}>
                                <div className={styles.cellContent}>
                                    <span>{hour}</span>
                                </div>
                            </td>
                            {columnIds.map((columnId) => (
                                <td key={columnId} className={styles.scheduleCell}>
                                    <div className={styles.cellContent}>
                                        {renderCell(columnId, hour)}
                                    </div>
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </section>
    );
};

export default ReadOnlyDailyTable;
