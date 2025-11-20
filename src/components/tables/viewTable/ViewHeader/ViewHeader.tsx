import React from "react";
import styles from "./ViewHeader.module.css";
import { DailyScheduleType, ColumnTypeValues } from "@/models/types/dailySchedule";
import ReadOnlyHeader from "@/components/ui/table/ReadOnlyHeader/ReadOnlyHeader";
import { DAYS_OF_WORK_WEEK } from "@/utils/time";

type ViewHeaderProps = {
    items: {
        title: string;
        color?: string;
        type?: DailyScheduleType["issueTeacherType"];
        teacherId?: string;
    }[];
    onClickHeader?: (teacherName: string, teacherId?: string) => void;
};

const ViewHeader: React.FC<ViewHeaderProps> = ({ items, onClickHeader }) => {
    return (
        <thead>
            <ReadOnlyHeader
                trs={DAYS_OF_WORK_WEEK}
                textPlaceholder={(text) => `יום ${text}׳`}
                emptyTrs={1}
                hasHour
            />
            <tr>
                <th className={styles.hourHeader}></th>
                {items.map((it, i) => {
                    const isClickable = onClickHeader && it.type !== ColumnTypeValues.event;
                    const cls = `${styles.dayHeader} ${isClickable ? styles.clickable : ""}`;

                    const handleClick = () => {
                        if (!isClickable) return;
                        onClickHeader(it.title, it.teacherId);
                    };

                    return (
                        <th
                            key={i}
                            className={cls}
                            style={{ background: it.color || "transparent" }}
                            onClick={
                                isClickable
                                    ? () => onClickHeader(it.title, it.teacherId)
                                    : undefined
                            }
                            role={isClickable ? "button" : undefined}
                            tabIndex={isClickable ? 0 : -1}
                            aria-disabled={!isClickable}
                            title={
                                isClickable
                                    ? "לחצו על שם המורה כדי לראות או להזין את חומרי הלימוד"
                                    : undefined
                            }
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
