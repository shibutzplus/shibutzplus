import React, { useEffect, useState } from "react";
import styles from "./DailyCol.module.css";
import DailyTeacherHeader from "../DailyTeacherHeader/DailyTeacherHeader";
import { ColumnType, DailyScheduleCell } from "@/models/types/dailySchedule";
import DailyTeacherCell from "../DailyTeacherCell/DailyTeacherCell";
import DailyEventHeader from "../DailyEventHeader/DailyEventHeader";
import DailyEventCell from "../DailyEventCell/DailyEventCell";
import LoadingDots from "@/components/loading/LoadingDots/LoadingDots";
import ShadowHeader from "../ShadowHeader/ShadowHeader";

type DailyColProps = {
    columnId: string;
    column: {
        [hour: string]: DailyScheduleCell;
    };
};

const DailyCol: React.FC<DailyColProps> = ({ columnId, column }) => {
    const [columnType, setColumnType] = useState<ColumnType>("event");
    const colFirtsObj = column["1"];

    useEffect(() => {
        if (colFirtsObj?.headerCol) {
            setColumnType(colFirtsObj?.headerCol.type);
        }
    }, [column]);

    return columnType === "event" ? (
        <div className={styles.dailyColumn} data-column-id={columnId}>
            <ShadowHeader columnId={columnId}>
                <DailyEventHeader columnId={columnId} type={columnType} />
            </ShadowHeader>
            <div style={{width: "100%", height: "50px"}}></div>
            <div className={styles.rows}>
                {colFirtsObj ? (
                    Object.entries(column).map(([hour, cell]) => (
                        <DailyEventCell key={hour} cell={cell} columnId={columnId} />
                    ))
                ) : (
                    <LoadingDots size="S" color="var(--background-color)" />
                )}
            </div>
        </div>
    ) : (
        <div className={styles.dailyColumn} data-column-id={columnId}>
            <ShadowHeader columnId={columnId}>
                <DailyTeacherHeader columnId={columnId} type={columnType} />
            </ShadowHeader>
            <div style={{width: "100%", height: "50px"}}></div>
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
                    <LoadingDots size="S" color="var(--background-color)" />
                )}
            </div>
        </div>
    );
};

export default DailyCol;
