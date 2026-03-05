import React, { useRef } from "react";
import { useColumnAnimation } from "@/hooks/useColumnAnimation";
import { useDailyTableContext } from "@/context/DailyTableContext";
import styles from "./MngrDailyBldCol.module.css";
import MngrDailyBldTeacherHeader from "../MngrDailyBldTeacherHeader/MngrDailyBldTeacherHeader";
import { DailyScheduleCell, ColumnType } from "@/models/types/dailySchedule";
import MngrDailyBldTeacherCell from "../MngrDailyBldTeacherCell/MngrDailyBldTeacherCell";
import MngrDailyBldEventHeader from "../MngrDailyBldEventHeader/MngrDailyBldEventHeader";
import MngrDailyBldEventCell from "../MngrDailyBldEventCell/MngrDailyBldEventCell";
import { TeacherType } from "@/models/types/teachers";

type MngrDailyBldColProps = {
    columnId: string;
    column: {
        [hour: string]: DailyScheduleCell;
    };
    onTeacherClick?: (teacher: TeacherType) => void;
};

const MngrDailyBldCol: React.FC<MngrDailyBldColProps> = ({ columnId, column }) => {
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

    const { deleteColumn } = useDailyTableContext();

    const handleDelete = () => {
        deleteColumn(columnId);
    };

    return columnType === "event" ? (
        <div className={`${styles.dailyColumn} ${styles.eventColumn}`} data-column-id={columnId}>
            <MngrDailyBldEventHeader columnId={columnId} onDelete={handleDelete} />
            <div className={`${styles.rows} ${animClass}`}>
                {colFirstObj
                    ? Object.entries(displayColumn).map(([hour, cell]) => (
                        <MngrDailyBldEventCell key={hour} cell={cell} columnId={columnId} />
                    ))
                    : null}
            </div>
        </div>
    ) : (
        <div className={`${styles.dailyColumn} ${styles.teacherColumn}`} data-column-id={columnId}>
            <MngrDailyBldTeacherHeader
                columnId={columnId}
                type={columnType}
                onDelete={handleDelete}
            />
            <div className={`${styles.rows} ${animClass}`}>
                {colFirstObj
                    ? Object.entries(displayColumn).map(([hour, cell]) => (
                        <MngrDailyBldTeacherCell
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

export default MngrDailyBldCol;
