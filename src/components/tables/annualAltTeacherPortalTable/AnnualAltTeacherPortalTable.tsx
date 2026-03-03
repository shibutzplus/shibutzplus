"use client";

import React from "react";
import styles from "./AnnualAltTeacherPortalTable.module.css";
import { useTeacherAltTableContext } from "@/context/TeacherAltTableContext";
import { calculateVisibleRowsForTeacher } from "@/utils/tableUtils";
import Preloader from "@/components/ui/Preloader/Preloader";

type AnnualAltTeacherPortalTableProps = {
    fromHour?: number;
    toHour?: number;
    selectedDate: string;
};

const AnnualAltTeacherPortalTable: React.FC<AnnualAltTeacherPortalTableProps> = ({
    fromHour = 1,
    toHour = 10,
    selectedDate,
}) => {
    const { mainPortalTable, hasFetched, isPortalLoading } = useTeacherAltTableContext();
    const dayTable = selectedDate ? mainPortalTable[selectedDate] : undefined;

    const wrapperRef = React.useRef<HTMLDivElement>(null);
    const theadRef = React.useRef<HTMLTableSectionElement>(null);
    const [cellHeight, setCellHeight] = React.useState<number | undefined>(undefined);

    const rows = React.useMemo(
        () => calculateVisibleRowsForTeacher(dayTable, fromHour, toHour),
        [dayTable, fromHour, toHour]
    );

    // Recalculate cell height whenever the wrapper resizes or rowcount changes
    React.useEffect(() => {
        const wrapper = wrapperRef.current;
        if (!wrapper || rows.length === 0) return;

        const calculate = () => {
            const totalH = wrapper.clientHeight;
            const headerH = theadRef.current?.offsetHeight ?? 0;
            const available = totalH - headerH;
            // 4px top + 4px bottom padding per row
            const cardH = Math.floor(available / rows.length) - 8;
            setCellHeight(Math.max(cardH, 24));
        };

        calculate();
        const ro = new ResizeObserver(calculate);
        ro.observe(wrapper);
        return () => ro.disconnect();
    }, [rows.length, hasFetched, isPortalLoading, dayTable]);

    if (!hasFetched || isPortalLoading || !dayTable) {
        return (
            <div className={styles.loaderContainer}>
                <Preloader />
            </div>
        );
    }

    if (Object.keys(dayTable).length === 0) {
        return (
            <div className={styles.emptyMessage}>
                אין שיעורים במערכת חירום ליום זה
            </div>
        );
    }

    const cardStyle: React.CSSProperties | undefined =
        cellHeight !== undefined ? { height: cellHeight, minHeight: cellHeight } : undefined;

    return (
        <div className={styles.tableWrapper} ref={wrapperRef}>
            <div className={styles.tableContainer}>
                <table className={styles.table}>
                    <thead ref={theadRef}>
                        <tr>
                            {/* Sticky hours header */}
                            <th className={`${styles.headerCell} ${styles.hoursColumn}`}>
                                <div className={`${styles.headerInner} ${styles.hoursHeader}`}></div>
                            </th>
                            <th className={styles.emptyColSeparator}></th>
                            <th className={`${styles.headerCell} ${styles.classColumn}`}>
                                <div className={styles.headerInner}>כיתה</div>
                            </th>
                            <th className={`${styles.headerCell} ${styles.subjectColumn}`}>
                                <div className={styles.headerInner}>מקצוע</div>
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((hour) => {
                            const row = dayTable?.[String(hour)];
                            const visibleClasses = row?.classes?.filter((c) => !c.activity) || [];
                            const isActivityOnly = (row?.classes?.length || 0) > 0 && visibleClasses.length === 0;
                            const classText = visibleClasses.map((c) => c.name).join(", ");
                            const subjectText = isActivityOnly ? "" : (row?.subject?.name ?? "");
                            const isEmpty = !row || isActivityOnly;
                            return (
                                <tr key={hour} className={isEmpty ? styles.emptyRow : styles.row}>
                                    {/* Sticky hours column — circle badge */}
                                    <td className={styles.hourCell}>
                                        <div className={styles.hourBadge}>{hour}</div>
                                    </td>
                                    <td className={styles.emptyColSeparator}></td>
                                    {/* Class card */}
                                    <td className={styles.classColumn}>
                                        {isEmpty
                                            ? <div className={styles.emptyCard} style={cardStyle} />
                                            : <div className={styles.cellCard} style={cardStyle}>
                                                <span className={styles.className}>{classText}</span>
                                            </div>
                                        }
                                    </td>
                                    {/* Subject card */}
                                    <td className={styles.subjectColumn}>
                                        {isEmpty
                                            ? <div className={styles.emptyCard} style={cardStyle} />
                                            : <div className={styles.cellCard} style={cardStyle}>
                                                <span className={styles.subjectName}>{subjectText}</span>
                                            </div>
                                        }
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AnnualAltTeacherPortalTable;
