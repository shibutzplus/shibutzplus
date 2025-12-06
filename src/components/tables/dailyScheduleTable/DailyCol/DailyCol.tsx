import React, { useEffect, useState } from "react";
import styles from "./DailyCol.module.css";
import DailyTeacherHeader from "../DailyTeacherHeader/DailyTeacherHeader";
import { ColumnType, DailyScheduleCell } from "@/models/types/dailySchedule";
import DailyTeacherCell from "../DailyTeacherCell/DailyTeacherCell";
import DailyEventHeader from "../DailyEventHeader/DailyEventHeader";
import DailyEventCell from "../DailyEventCell/DailyEventCell";
import { TeacherType } from "@/models/types/teachers";

type DailyColProps = {
    columnId: string;
    column: {
        [hour: string]: DailyScheduleCell;
    };
    onTeacherClick?: (teacher: TeacherType) => void;
};

const DailyCol: React.FC<DailyColProps> = ({ columnId, column, onTeacherClick }) => {
    // Animation state
    const [displayColumn, setDisplayColumn] = useState(column);
    const [isFadingOut, setIsFadingOut] = useState(false);

    const colFirstObj = displayColumn["1"];
    const columnType = colFirstObj?.headerCol?.type || "event";

    useEffect(() => {
        // If column data changed
        if (JSON.stringify(column) !== JSON.stringify(displayColumn)) {
            if (columnType !== "event") {
                setIsFadingOut(true);

                const timer = setTimeout(() => {
                    setDisplayColumn(column);
                    setIsFadingOut(false);
                }, 300);
                return () => clearTimeout(timer);
            } else {
                setDisplayColumn(column);
            }
        }
    }, [column, displayColumn, columnType]);

    const animClass = isFadingOut ? styles.fadeOut : styles.fadeIn;

    return columnType === "event" ? (
        <div className={styles.dailyColumn} data-column-id={columnId}>
            <DailyEventHeader columnId={columnId} type={columnType} />
            <div className={`${styles.rows} ${animClass}`}>
                {colFirstObj &&
                    Object.entries(displayColumn).map(([hour, cell]) => (
                        <DailyEventCell key={hour} cell={cell} columnId={columnId} />
                    ))}
            </div>
        </div>
    ) : (
        <div className={styles.dailyColumn} data-column-id={columnId}>
            <DailyTeacherHeader
                columnId={columnId}
                type={columnType}
                onTeacherClick={onTeacherClick}
            />
            <div className={`${styles.rows} ${animClass}`}>
                {colFirstObj &&
                    Object.entries(displayColumn).map(([hour, cell]) => (
                        <DailyTeacherCell
                            key={hour}
                            cell={cell}
                            columnId={columnId}
                            type={columnType}
                        />
                    ))}
            </div>
        </div>
    );
};

export default DailyCol;
