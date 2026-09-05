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
    const { classNameText, rawSubjectName, text, subTeacherName, isEmpty, isActivity, isMissing } = getCellDisplayData(cell, type, appType);

    if (isEmpty) {
        return (
            <div className={styles.cellContent}>
                <EmptyCell />
            </div>
        );
    }

    const firstDetail = classNameText || text;
    const secondDetail = rawSubjectName || "";

    return (
        <div className={styles.cellContent}>
            <div className={styles.innerCellContent} style={{ gap: "4px", justifyContent: "center" }}>
                {subTeacherName ? (
                    <div className={styles.subTeacherName}>{subTeacherName}</div>
                ) : isMissing ? (
                    <div className={styles.missingSubTeacherName}>אין ממלא מקום</div>
                ) : null}
                {firstDetail && (
                    <span
                        className={`${styles.detailText} ${isActivity ? styles.activityText : ""}`}
                    >
                        {firstDetail}
                    </span>
                )}
                {secondDetail && (
                    <span
                        className={`${styles.detailText} ${isActivity ? styles.activityText : ""}`}
                    >
                        {secondDetail}
                    </span>
                )}
            </div>
        </div>
    );
};

export default CommonDailySchoolTeacherCell;
