import React, { useMemo } from "react";
import MngrMissingReportCell from "../MngrMissingReportCell/MngrMissingReportCell";
import styles from "./MngrMissingReportTable.module.css";
import { SCHOOL_MONTHS, daysInMonth, getCurrentYear } from "@/utils/time";
import { TeacherType } from "@/models/types/teachers";
import { MissingReportDictionary } from "@/app/(private)/missing-report/page";
import { ColumnTypeValues } from "@/models/types/dailySchedule";

type MngrMissingReportTableProps = {
    month: string;
    teacherId: string | null;
    teachers: TeacherType[];
    reportData: MissingReportDictionary;
    onRefresh: () => void;
};

const MngrMissingReportTable: React.FC<MngrMissingReportTableProps> = ({
    month,
    teacherId,
    teachers,
    reportData,
    onRefresh,
}) => {
    const isRecordDisplayable = (r: any) => {
        if (r.columnType === ColumnTypeValues.missingTeacher) return true;
        if (r.columnType === ColumnTypeValues.existingTeacher) {
            return !!r.subTeacher && !!r.reason;
        }
        return false;
    };

    const displayedTeachers = useMemo(() => {
        const getIsVisible = (tId: string) => {
            const teacherData = reportData[tId];
            if (!teacherData) return false;
            return Object.values(teacherData).some(dayRecords =>
                dayRecords.some(isRecordDisplayable)
            );
        };

        if (!teacherId || teacherId === "all") {
            return teachers.filter(t => getIsVisible(t.id));
        }
        return teachers.filter((t) => t.id === teacherId && getIsVisible(t.id));
    }, [teacherId, teachers, reportData]);

    // Determine how many days to display based on selected month and actual data
    const activeDaysArray = useMemo(() => {
        let baseDays: number[] = [];
        if (month === "all") {
            baseDays = Array.from({ length: 31 }, (_, i) => i + 1);
        } else {
            const monthIndex = SCHOOL_MONTHS.indexOf(month);
            if (monthIndex !== -1) {
                const actualMonth = (monthIndex + 8) % 12;
                const maxDays = daysInMonth(getCurrentYear(), actualMonth + 1);
                baseDays = Array.from({ length: maxDays }, (_, i) => i + 1);
            }
        }

        // Filter out days that have no displayable data for any displayed teacher
        return baseDays.filter(dayNum => {
            return displayedTeachers.some(teacher => {
                const dayRecords = reportData[teacher.id]?.[dayNum];
                return dayRecords?.some(isRecordDisplayable);
            });
        });
    }, [month, displayedTeachers, reportData]);

    if (displayedTeachers.length === 0) {
        return (
            <div className={styles.placeholder}>אין חיסורים החודש</div>
        );
    }

    return (
        <div className={styles.tableContainer}>
            <table className={styles.scheduleTable}>
                <thead>
                    <tr>
                        <th className={`${styles.headerCell} ${styles.teacherColumn}`}></th>
                        <th className={styles.emptyColSeparator}></th>
                        {activeDaysArray.map((dayNum) => (
                            <th key={dayNum} className={`${styles.headerCell} ${styles.dayColumn}`}>
                                <div className={styles.headerInner}>{dayNum}</div>
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className={styles.scheduleTableBody}>
                    {displayedTeachers.map((teacher) => (
                        <tr key={teacher.id}>
                            <td className={styles.teacherColumn}>
                                <div className={styles.teacherCell}>{teacher.name}</div>
                            </td>
                            <td className={styles.emptyCell}></td>
                            {activeDaysArray.map((dayNum) => (
                                <MngrMissingReportCell
                                    key={`${dayNum}-${teacher.id}`}
                                    dayNumber={dayNum}
                                    teacherId={teacher.id}
                                    records={reportData[teacher.id]?.[dayNum] || []}
                                    onRefresh={onRefresh}
                                />
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default MngrMissingReportTable;
