import React from "react";
import styles from "./ViewHeader.module.css";
import { DailyScheduleType, ColumnTypeValues } from "@/models/types/dailySchedule";

type ViewHeaderProps = {
    items: { title: string; color?: string; type?: DailyScheduleType["issueTeacherType"]; teacherId?: string }[];
    onTeacherClick?: (teacherName: string, teacherId?: string) => void;
    isManager?: boolean;
};

const ViewHeader: React.FC<ViewHeaderProps> = ({ items, onTeacherClick, isManager }) => {
    return (
        <thead>
            <tr>
                <th className={styles.hourHeader}></th>
                {items.map((it, i) => {
                    const isClickable = isManager && it.type !== ColumnTypeValues.event; // שינוי כאן
                    const cls = `${styles.dayHeader} ${isClickable ? styles.clickable : ""}`;

                    const handleClick = () => {
                        if (!isClickable || !onTeacherClick) return;
                        onTeacherClick(it.title, it.teacherId);
                    };

                    return (
                        <th
                            key={i}
                            className={cls}
                            style={{ background: it.color || "transparent" }}
                            onClick={handleClick}
                            role={isClickable ? "button" : undefined}
                            tabIndex={isClickable ? 0 : -1}
                            aria-disabled={!isClickable}
                            title={isClickable ? "לחץ על שם המורה כדי לראות או להזין את חומרי הלימוד" : undefined}
                        >
                            {it.title || "—"}
                        </th>
                    );
                })}
            </tr>
        </thead>
    );
};

export default ViewHeader;
