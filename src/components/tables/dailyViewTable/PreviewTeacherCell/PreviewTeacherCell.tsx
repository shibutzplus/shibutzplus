import React from "react";
import styles from "./PreviewTeacherCell.module.css";
import { ColumnType, DailyScheduleCell } from "@/models/types/dailySchedule";
import EmptyCell from "@/components/ui/table/EmptyCell/EmptyCell";
import { AppType } from "@/models/types";
import { getCellDisplayData } from '@/utils/dailyCellDisplay';

type PreviewTeacherCellProps = {
    columnId: string;
    cell: DailyScheduleCell;
    type: ColumnType;
    appType?: AppType;
};

const PreviewTeacherCell: React.FC<PreviewTeacherCellProps> = ({ cell, type, appType = "private" }) => {
    const { text, subTeacherName, isMissing, isEmpty, isActivity } = getCellDisplayData(cell, type, appType);

    if (isEmpty) {
        return (
            <div className={styles.cellContent}>
                <EmptyCell />
            </div>
        );
    }

    return (
        <div className={styles.cellContent}>
            <div className={styles.innerCellContent}>
                <span
                    className={`${styles.textContent} ${isActivity ? styles.activityText : ""}`}
                >
                    {text}
                </span>
                {subTeacherName ? (
                    <div className={styles.subTeacherName}>{subTeacherName}</div>
                ) : isMissing ? (
                    <div className={styles.missingSubTeacherName}>אין ממלא מקום</div>
                ) : null}
            </div>
        </div>
    );
};

export default PreviewTeacherCell;
