import React from "react";
import styles from "./DailyCol.module.css";
import EmptyCell from "@/components/ui/table/EmptyCell/EmptyCell";
import DailyTeacherHeader from "../DailyTeacherHeader/DailyTeacherHeader";
import { DailyScheduleCell } from "@/models/types/dailySchedule";
import DailyTeacherCell from "../DailyTeacherCell/DailyTeacherCell";

type DailyColProps = {
    columnId: string;
    column: {
        [hour: string]: DailyScheduleCell;
    };
};

const DailyCol: React.FC<DailyColProps> = ({ columnId, column }) => {
    const columnType = column["1"]?.headerCol?.type || "existingTeacher";
    return (
        <div className={styles.dailyColumn}>
            <DailyTeacherHeader columnId={columnId} type={columnType} />
            <div className={styles.rows}>
                {Object.entries(column).map(([hour, cell]) => (
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
