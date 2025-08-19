"use client";

import React from "react";
import { DailyScheduleType } from "@/models/types/dailySchedule";
import styles from "./ReadOnlyDailyTable.module.css";

interface ReadOnlyDailyTableProps {
    scheduleData: DailyScheduleType[];
}

const ReadOnlyDailyTable: React.FC<ReadOnlyDailyTableProps> = ({ scheduleData }) => {
    // Group schedule data by hour and organize by columns
    const organizeScheduleData = () => {
        const hourlyData: { [hour: number]: { [columnId: string]: DailyScheduleType } } = {};
        const columns = new Set<string>();

        // Process schedule data
        scheduleData.forEach(item => {
            if (!hourlyData[item.hour]) {
                hourlyData[item.hour] = {};
            }
            
            const columnId = item.columnId || `${item.class?.name || 'כיתה'}-${item.subject?.name || 'מקצוע'}`;
            hourlyData[item.hour][columnId] = item;
            columns.add(columnId);
        });

        return { hourlyData, columns: Array.from(columns).sort() };
    };

    const { hourlyData, columns } = organizeScheduleData();
    const hours = Array.from({ length: 8 }, (_, i) => i + 1); // 8 hours

    const renderCellContent = (item: DailyScheduleType | undefined) => {
        if (!item) return null;

        // Event column
        if (item.eventTitle || item.event) {
            return (
                <div className={styles.eventCell}>
                    <div className={styles.eventTitle}>{item.eventTitle}</div>
                    {item.event && <div className={styles.eventDescription}>{item.event}</div>}
                </div>
            );
        }

        // Teacher columns (existing teacher, missing teacher)
        const hasAbsentTeacher = item.absentTeacher;
        const hasSubTeacher = item.subTeacher;
        const hasPresentTeacher = item.presentTeacher;

        return (
            <div className={styles.teacherCell}>
                <div className={styles.classSubject}>
                    {item.class?.name} - {item.subject?.name}
                </div>
                
                {hasAbsentTeacher && (
                    <div className={styles.absentTeacher}>
                        <span className={styles.label}>נעדר:</span>
                        <span className={styles.teacherName}>{item.absentTeacher?.name}</span>
                    </div>
                )}
                
                {hasPresentTeacher && (
                    <div className={styles.presentTeacher}>
                        <span className={styles.label}>נוכח:</span>
                        <span className={styles.teacherName}>{item.presentTeacher?.name}</span>
                    </div>
                )}
                
                {hasSubTeacher && (
                    <div className={styles.subTeacher}>
                        <span className={styles.label}>מחליף:</span>
                        <span className={styles.teacherName}>{item.subTeacher?.name}</span>
                    </div>
                )}
            </div>
        );
    };

    if (scheduleData.length === 0) {
        return (
            <div className={styles.noData}>
                אין נתונים להצגה עבור התאריך שנבחר
            </div>
        );
    }

    return (
        <div className={styles.tableContainer}>
            <table className={styles.scheduleTable}>
                <thead>
                    <tr>
                        <th className={styles.hourHeader}>שעה</th>
                        {columns.map(columnId => (
                            <th key={columnId} className={styles.columnHeader}>
                                {columnId}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {hours.map(hour => (
                        <tr key={hour}>
                            <td className={styles.hourCell}>{hour}</td>
                            {columns.map(columnId => (
                                <td key={`${hour}-${columnId}`} className={styles.scheduleCell}>
                                    {renderCellContent(hourlyData[hour]?.[columnId])}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default ReadOnlyDailyTable;
