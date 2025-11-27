import React from "react";
import { ColumnType, DailyScheduleCell } from "@/models/types/dailySchedule";
import styles from "./PreviewTeacherHeader.module.css";
import { COLOR_BY_TYPE } from "@/models/constant/daily";
import { useStickyHeader } from "@/hooks/scroll/useStickyHeader";
import Icons from "@/style/icons";
import { AppType } from "@/models/types";

type PreviewTeacherHeaderProps = {
    type: ColumnType;
    appType: AppType;
    onTeacherClick?: (teacherName: string) => void;
    column: {
        [hour: string]: DailyScheduleCell;
    };
};

const PreviewTeacherHeader: React.FC<PreviewTeacherHeaderProps> = ({
    type,
    column,
    appType,
    onTeacherClick,
}) => {
    const selectedTeacherData = column?.["1"]?.headerCol?.headerTeacher;
    const isClickable = !!selectedTeacherData?.name;
    const headerRef = React.useRef<HTMLDivElement>(null);
    useStickyHeader(headerRef);

    const handleClick = () => {
        if (isClickable && selectedTeacherData?.name && onTeacherClick) {
            onTeacherClick(selectedTeacherData.name);
        }
    };

    return (
        <div
            ref={headerRef}
            className={`${styles.columnHeaderWrapper} ${isClickable ? styles.clickable : ""}`}
        >
            <div className={styles.columnHeader} style={{ backgroundColor: COLOR_BY_TYPE[type] }}>
                {appType === "private" && isClickable && (
                    <Icons.eye
                        className={styles.eyeIcon}
                        onClick={handleClick}
                        size={20}
                        title="לחצו על שם המורה כדי לראות או להזין את חומרי הלימוד"
                    />
                )}
                <div className={styles.headerText}>{selectedTeacherData?.name || ""}</div>
            </div>
        </div>
    );
};

export default PreviewTeacherHeader;
