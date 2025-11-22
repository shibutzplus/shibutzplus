import React from "react";
import { ColumnType } from "@/models/types/dailySchedule";
import { useDailyTableContext } from "@/context/DailyTableContext";
import { COLOR_BY_TYPE } from "@/style/tableColors";
import styles from "./PreviewTeacherHeader.module.css";

type PreviewTeacherHeaderProps = {
    columnId: string;
    type: ColumnType;
    onTeacherClick?: (teacherName: string) => void;
};

const PreviewTeacherHeader: React.FC<PreviewTeacherHeaderProps> = ({ columnId, type, onTeacherClick }) => {
    const { mainDailyTable, selectedDate } = useDailyTableContext();

    const selectedTeacherData =
        mainDailyTable[selectedDate]?.[columnId]?.["1"]?.headerCol?.headerTeacher;
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
