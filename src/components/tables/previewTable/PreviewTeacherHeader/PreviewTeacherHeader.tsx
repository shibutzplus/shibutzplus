import React from "react";
import { ColumnType, DailyScheduleCell } from "@/models/types/dailySchedule";
import styles from "./PreviewTeacherHeader.module.css";
import { COLOR_BY_TYPE } from "@/models/constant/daily";

type PreviewTeacherHeaderProps = {
    type: ColumnType;
    onTeacherClick?: (teacherName: string) => void;
    column: {
        [hour: string]: DailyScheduleCell;
    };
};

const PreviewTeacherHeader: React.FC<PreviewTeacherHeaderProps> = ({
    type,
    column,
    onTeacherClick,
}) => {
    const selectedTeacherData = column?.["1"]?.headerCol?.headerTeacher;
    const isClickable = !!selectedTeacherData?.name;

    const handleClick = () => {
        if (isClickable && selectedTeacherData?.name && onTeacherClick) {
            onTeacherClick(selectedTeacherData.name);
        }
    };

    return (
        <div
            className={`${styles.header} ${isClickable ? styles.clickable : ""}`}
            style={{ backgroundColor: COLOR_BY_TYPE[type] }}
            onClick={isClickable ? handleClick : undefined}
            aria-disabled={!isClickable}
            role={isClickable ? "button" : undefined}
            tabIndex={isClickable ? 0 : -1}
            title={isClickable ? "לחצו על שם המורה כדי לראות או להזין את חומרי הלימוד" : undefined}
        >
            <div className={styles.headerText}>{selectedTeacherData?.name || ""}</div>
        </div>
    );
};

export default PreviewTeacherHeader;
