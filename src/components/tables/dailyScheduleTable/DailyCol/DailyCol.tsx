import React, { useEffect, useState } from "react";
import styles from "./DailyCol.module.css";
import DailyTeacherHeader from "../DailyTeacherHeader/DailyTeacherHeader";
import { ColumnType, DailyScheduleCell } from "@/models/types/dailySchedule";
import DailyTeacherCell from "../DailyTeacherCell/DailyTeacherCell";
import DailyEventHeader from "../DailyEventHeader/DailyEventHeader";
import DailyEventCell from "../DailyEventCell/DailyEventCell";
import LoadingDots from "@/components/loading/LoadingDots/LoadingDots";
import { TableDailyHeaderHeight } from "@/style/root";
import { TeacherType } from "@/models/types/teachers";

type DailyColProps = {
    columnId: string;
    column: {
        [hour: string]: DailyScheduleCell;
    };
    onTeacherClick?: (teacher: TeacherType) => void;
};

const DailyCol: React.FC<DailyColProps> = ({ columnId, column, onTeacherClick }) => {
    const [columnType, setColumnType] = useState<ColumnType>("event"); //TODO: need to be "empty"
    const colFirtsObj = column["1"];

    useEffect(() => {
        if (colFirtsObj?.headerCol) {
            setColumnType(colFirtsObj?.headerCol.type);
        }
    }, [column]);

    return columnType === "event" ? (
        <div className={styles.dailyColumn} data-column-id={columnId}>
            <DailyEventHeader columnId={columnId} type={columnType} />
            <div className={styles.rows}>
                {colFirtsObj ? (
                    Object.entries(column).map(([hour, cell]) => (
                        <DailyEventCell key={hour} cell={cell} columnId={columnId} />
                    ))
                ) : (
                    <LoadingDots size="S" />
                )}
            </div>
        </div>
    ) : (
        <div className={styles.dailyColumn} data-column-id={columnId}>
            <DailyTeacherHeader
                columnId={columnId}
                type={columnType}
                onTeacherClick={onTeacherClick}
            />
            <div className={styles.rows}>
                {colFirtsObj ? (
                    Object.entries(column).map(([hour, cell]) => (
                        <DailyTeacherCell
                            key={hour}
                            cell={cell}
                            columnId={columnId}
                            type={columnType}
                        />
                    ))
                ) : (
                    <LoadingDots size="S" />
                )}
            </div>
        </div>
    );
};

export default DailyCol;
