import React from "react";
import styles from "./CommonDailySchoolTeacherCell.module.css";
import { ColumnType, DailyScheduleCell } from "@/models/types/dailySchedule";
import EmptyCell from "@/components/ui/table/EmptyCell/EmptyCell";
import { AppType } from "@/models/types";
import { getCellDisplayData } from '@/utils/dailyCellDisplay';

type CommonDailySchoolTeacherCellProps = {
    columnId: string;
    cell: DailyScheduleCell;
    type: ColumnType;
    appType?: AppType;
};

const CommonDailySchoolTeacherCell: React.FC<CommonDailySchoolTeacherCellProps> = ({ cell, type, appType = "private" }) => {
    const { text, subTeacherName, isEmpty, isActivity } = getCellDisplayData(cell, type, appType);

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
                ) : null}
            </div>
        </div>
    );
};

export default CommonDailySchoolTeacherCell;
