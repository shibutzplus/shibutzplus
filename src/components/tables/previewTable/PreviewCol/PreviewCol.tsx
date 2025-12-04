import React, { useEffect, useState } from "react";
import styles from "./PreviewCol.module.css";
import { ColumnType, DailySchedule } from "@/models/types/dailySchedule";
import LoadingDots from "@/components/loading/LoadingDots/LoadingDots";
import PreviewEventHeader from "../PreviewEventHeader/PreviewEventHeader";
import PreviewEventCell from "../PreviewEventCell/PreviewEventCell";
import PreviewTeacherHeader from "../PreviewTeacherHeader/PreviewTeacherHeader";
import PreviewTeacherCell from "../PreviewTeacherCell/PreviewTeacherCell";
import { AppType } from "@/models/types";
import { TeacherType } from "@/models/types/teachers";

type PreviewColProps = {
    columnId: string;
    appType: AppType;
    mainDailyTable: DailySchedule;
    selectedDate: string;
    onTeacherClick?: (teacher: TeacherType) => Promise<void>;
};

const PreviewCol: React.FC<PreviewColProps> = ({
    columnId,
    appType,
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
            <div className={styles.rows}>
                {colFirstObj ? (
                    Object.entries(column).map(([hour, cell]) => (
                        <PreviewEventCell key={hour} cell={cell} columnId={columnId} />
                    ))
                ) : (
                    <LoadingDots size="S" />
                )}
            </div>
        </div>
    ) : (
        <div className={styles.previewColumn} data-column-id={columnId}>
            <div className={styles.hide} />
            <PreviewTeacherHeader
                column={column}
                appType={appType}
                type={columnType}
                selectedDate={selectedDate}
                onTeacherClick={onTeacherClick}
            />
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
                    <LoadingDots size="S" />
                )}
            </div>
        </div>
    );
};

export default PreviewCol;
