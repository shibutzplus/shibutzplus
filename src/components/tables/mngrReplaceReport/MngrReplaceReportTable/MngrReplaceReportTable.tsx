import React, { useMemo } from "react";
import styles from "./MngrReplaceReportTable.module.css";
import { SCHOOL_MONTHS, daysInMonth, getCurrentYear, getDayLetterByMonthAndDay } from "@/utils/time";
import { TeacherType } from "@/models/types/teachers";
import { ReplaceReportDictionary } from "@/app/(private)/replace-report/page";

type MngrReplaceReportTableProps = {
    month: string;
    teacherId: string | null;
    teachers: TeacherType[];
    reportData: ReplaceReportDictionary;
};

const MngrReplaceReportTable: React.FC<MngrReplaceReportTableProps> = ({
    month,
    teacherId,
    teachers,
    reportData,
}) => {
    // Teachers that have at least one substitution hour this month
    const displayedTeachers = useMemo(() => {
        const hasData = (tId: string) => {
            const days = reportData[tId];
            if (!days) return false;
            return Object.values(days).some((count) => count > 0);
        };

        if (!teacherId || teacherId === "all") {
            return teachers.filter((t) => hasData(t.id));
        }
        return teachers.filter((t) => t.id === teacherId && hasData(t.id));
    }, [teacherId, teachers, reportData]);

    // Active days: days that have at least one substitution for any displayed teacher
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

        return baseDays.filter((dayNum) =>
            displayedTeachers.some((teacher) => (reportData[teacher.id]?.[dayNum] ?? 0) > 0)
        );
    }, [month, displayedTeachers, reportData]);

    if (displayedTeachers.length === 0) {
        return (
            <div className={styles.placeholder}>אין נתוני החלפה החודש</div>
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
                                <div className={styles.headerInner}>
                                    {dayNum}
                                    {month !== "all" && (
                                        <span className={styles.dayLetter}>
                                            ({getDayLetterByMonthAndDay(month, dayNum)})
                                        </span>
                                    )}
                                </div>
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
                            {activeDaysArray.map((dayNum) => {
                                const count = reportData[teacher.id]?.[dayNum] ?? 0;
                                return (
                                    <td
                                        key={`${teacher.id}-${dayNum}`}
                                        className={styles.scheduleCell}
                                    >
                                        <div className={styles.cellContent}>
                                            {count > 0 && (
                                                <span className={styles.hourCount}>{count}</span>
                                            )}
                                        </div>
                                    </td>
                                );
                            })}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default MngrReplaceReportTable;
