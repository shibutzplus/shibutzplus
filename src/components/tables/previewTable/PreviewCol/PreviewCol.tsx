import React, { useEffect, useState } from "react";
import styles from "./PreviewCol.module.css";
import { ColumnType, DailyScheduleCell } from "@/models/types/dailySchedule";
import LoadingDots from "@/components/loading/LoadingDots/LoadingDots";
import PreviewEventHeader from "../PreviewEventHeader/PreviewEventHeader";
import PreviewEventCell from "../PreviewEventCell/PreviewEventCell";
import PreviewTeacherHeader from "../PreviewTeacherHeader/PreviewTeacherHeader";
import PreviewTeacherCell from "../PreviewTeacherCell/PreviewTeacherCell";
import ShadowHeader from "@/components/tables/dailyScheduleTable/ShadowHeader/ShadowHeader";

type PreviewColProps = {
    columnId: string;
    column: {
        [hour: string]: DailyScheduleCell;
    };
    onTeacherClick?: (teacherName: string) => void;
};

const PreviewCol: React.FC<PreviewColProps> = ({ columnId, column, onTeacherClick }) => {
    const [columnType, setColumnType] = useState<ColumnType>("event");
    const colFirstObj = column["1"];

    useEffect(() => {
        if (colFirstObj?.headerCol) {
            setColumnType(colFirstObj?.headerCol.type);
        }
    }, [column]);

    return columnType === "event" ? (
        <div className={styles.previewColumn} data-column-id={columnId}>
            <ShadowHeader columnId={columnId}>
                <PreviewEventHeader columnId={columnId} type={columnType} />
            </ShadowHeader>
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
            <ShadowHeader columnId={columnId}>
                <PreviewTeacherHeader columnId={columnId} type={columnType} onTeacherClick={onTeacherClick} />
            </ShadowHeader>
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
