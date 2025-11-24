import React, { useEffect, useState } from "react";
import styles from "./PreviewCol.module.css";
import { ColumnType, DailySchedule } from "@/models/types/dailySchedule";
import LoadingDots from "@/components/loading/LoadingDots/LoadingDots";
import PreviewEventHeader from "../PreviewEventHeader/PreviewEventHeader";
import PreviewEventCell from "../PreviewEventCell/PreviewEventCell";
import PreviewTeacherHeader from "../PreviewTeacherHeader/PreviewTeacherHeader";
import PreviewTeacherCell from "../PreviewTeacherCell/PreviewTeacherCell";

type PreviewColProps = {
    columnId: string;
    mainDailyTable: DailySchedule;
    selectedDate: string;
    onTeacherClick?: (teacherName: string) => void;
};

const PreviewCol: React.FC<PreviewColProps> = ({
    columnId,
    mainDailyTable,
    selectedDate,
    onTeacherClick,
}) => {
    const [columnType, setColumnType] = useState<ColumnType>("event");
    const column = mainDailyTable[selectedDate]?.[columnId];
    const colFirstObj = column?.["1"];

    useEffect(() => {
        if (colFirstObj?.headerCol) {
            setColumnType(colFirstObj?.headerCol.type);
        }
    }, [column]);

    return columnType === "event" ? (
        <div className={styles.previewColumn} data-column-id={columnId}>
            <PreviewEventHeader type={columnType} column={column} />
            <div style={{ width: "100%", height: "50px" }}></div>
            <div className={styles.rows}>
                {colFirstObj ? (
                    Object.entries(column).map(([hour, cell]) => (
                        <PreviewEventCell key={hour} cell={cell} columnId={columnId} />
                    ))
                ) : (
                    <LoadingDots size="S" color="var(--background-color)" />
                )}
            </div>
        </div>
    ) : (
        <div className={styles.previewColumn} data-column-id={columnId}>
            <PreviewTeacherHeader
                column={column}
                type={columnType}
                onTeacherClick={onTeacherClick}
            />
            <div style={{ width: "100%", height: "50px" }}></div>
            <div className={styles.rows}>
                {colFirstObj ? (
                    Object.entries(column).map(([hour, cell]) => (
                        <PreviewTeacherCell
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

export default PreviewCol;
