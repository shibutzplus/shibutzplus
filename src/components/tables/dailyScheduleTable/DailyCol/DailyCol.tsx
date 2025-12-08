import React, { useRef } from "react";
import { useColumnAnimation } from "@/hooks/useColumnAnimation";
import styles from "./DailyCol.module.css";
import DailyTeacherHeader from "../DailyTeacherHeader/DailyTeacherHeader";
import { DailyScheduleCell, ColumnType } from "@/models/types/dailySchedule";
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
    const { displayColumn, isFadingOut } = useColumnAnimation(column);
    const colFirstObj =
        displayColumn["1"] ||
        Object.values(displayColumn).find((cell) => cell?.headerCol?.type);

    const lastTypeRef = useRef<ColumnType | null>(null);
    const foundType = colFirstObj?.headerCol?.type;

    if (foundType) {
        lastTypeRef.current = foundType;
    }

    const columnType = foundType || lastTypeRef.current || "event";
    const animClass = isFadingOut ? styles.fadeOut : styles.fadeIn;

    return columnType === "event" ? (
        <div className={styles.dailyColumn} data-column-id={columnId}>
            <DailyEventHeader columnId={columnId} type={columnType} />
            <div className={`${styles.rows} ${animClass}`}>
                {colFirstObj
                    ? Object.entries(displayColumn).map(([hour, cell]) => (
                        <DailyEventCell key={hour} cell={cell} columnId={columnId} />
                    ))
                    : null}
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
                {colFirstObj
                    ? Object.entries(displayColumn).map(([hour, cell]) => (
                        <DailyTeacherCell
                            key={hour}
                            cell={cell}
                            columnId={columnId}
                            type={columnType}
                        />
                    ))
                    : null}
            </div>
        </div>
    );
};

export default DailyCol;
