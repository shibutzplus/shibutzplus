import React, { useEffect, useState } from "react";
import styles from "./DailyCol.module.css";
import DailyTeacherHeader from "../DailyTeacherHeader/DailyTeacherHeader";
import { ColumnType, DailyScheduleCell } from "@/models/types/dailySchedule";
import DailyTeacherCell from "../DailyTeacherCell/DailyTeacherCell";
import DailyEventHeader from "../DailyEventHeader/DailyEventHeader";
import DailyEventCell from "../DailyEventCell/DailyEventCell";
import LoadingDots from "@/components/loading/LoadingDots/LoadingDots";

type DailyColProps = {
    columnId: string;
    column: {
        [hour: string]: DailyScheduleCell;
    };
};

const DailyCol: React.FC<DailyColProps> = ({ columnId, column }) => {
    const [columnType, setColumnType] = useState<ColumnType>("event");

    useEffect(() => {
        if (column["1"]?.headerCol) {
            setColumnType(column["1"]?.headerCol.type);
        }
    }, [column]);

    return columnType === "event" ? (
        <div className={styles.dailyColumn}>
            <DailyEventHeader columnId={columnId} type={columnType} />
            <div className={styles.rows}>
                {column["1"] ? (
                    Object.entries(column).map(([hour, cell]) => (
                        <DailyEventCell key={hour} cell={cell} columnId={columnId} />
                    ))
                ) : <LoadingDots size="S" color="var(--background-color)" />}
            </div>
        </div>
    ) : (
        <div className={styles.dailyColumn}>
            <DailyTeacherHeader columnId={columnId} type={columnType} />
            <div className={styles.rows}>
                {column["1"] ? (
                    Object.entries(column).map(([hour, cell]) => (
                        <DailyTeacherCell
                            key={hour}
                            cell={cell}
                            columnId={columnId}
                            type={columnType}
                        />
                    ))
                ) : <LoadingDots size="S" color="var(--background-color)" />}
            </div>
        </div>
    );
};

export default DailyCol;
