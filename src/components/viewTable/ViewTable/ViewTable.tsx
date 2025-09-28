"use client";

import React, { useMemo } from "react";
import { TableRows } from "@/models/constant/table";
import { DailyScheduleType } from "@/models/types/dailySchedule";
import { getHeaderItems, sortAndGroupScheduleData } from "@/services/portalDailyScheduleService";
import ViewHeader from "../ViewHeader/ViewHeader";
import ViewTeacherCell from "../ViewTeacherCell/ViewTeacherCell";
import ViewEventCell from "../ViewEventCell/ViewEventCell";
import NotPublishedLayout from "@/components/layout/NotPublishedLayout/NotPublishedLayout";
import styles from "./ViewTable.module.css";

type ReadOnlyDailyTableProps = {
    scheduleData: DailyScheduleType[];
    hasMobileNav?: boolean;
    noScheduleTitle?: string;
    noScheduleSubTitle?: string[];
};

const ViewTable: React.FC<ReadOnlyDailyTableProps> = ({
    scheduleData,
    hasMobileNav = false,
    noScheduleTitle,
    noScheduleSubTitle,
}) => {
    if (scheduleData.length === 0)
        return (
            <NotPublishedLayout
                title={noScheduleTitle || "אין נתונים להצגה"}
                subTitle={noScheduleSubTitle || ["לא פורסמה מערכת עבור יום זה"]}
            />
        );

    const scheduleByColumn = React.useMemo(() => {
        if (scheduleData.length === 0) return {};
        return sortAndGroupScheduleData(scheduleData);
    }, [scheduleData]);

    const headerItems = useMemo(() => {
        return getHeaderItems(scheduleByColumn);
    }, [scheduleByColumn]);

    const columnIds = useMemo(() => Object.keys(scheduleByColumn), [scheduleByColumn]);
    const hours = useMemo(() => Array.from({ length: TableRows }, (_, i) => i + 1), []);

    const renderCell = (columnId: string, hour: number) => {
        const cellData = scheduleByColumn[columnId]?.[hour];
        if (!cellData) return <div className={styles.emptyCell}></div>;
        if (cellData.issueTeacherType === "event" && cellData.event)
            return <ViewEventCell cellData={cellData} />;
        return <ViewTeacherCell cellData={cellData} />;
    };

    return (
        <section
            className={`${styles.tableContainer} ${hasMobileNav ? styles.withMobileNav : ""}`}
            aria-label="מערכת יומית"
        >
            <table className={styles.scheduleTable}>
                <ViewHeader items={headerItems} />
                <tbody>
                    {hours.map((hour) => (
                        <tr key={hour}>
                            <td className={styles.hourCell}>
                                <div className={styles.cellContentHour}>
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

export default ViewTable;
