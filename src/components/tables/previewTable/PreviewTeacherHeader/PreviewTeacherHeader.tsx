import React from "react";
import { ColumnType, DailyScheduleCell } from "@/models/types/dailySchedule";
import styles from "./PreviewTeacherHeader.module.css";
import { COLOR_BY_TYPE } from "@/models/constant/daily";
import { useStickyHeader } from "@/hooks/scroll/useStickyHeader";
import Icons from "@/style/icons";
import { AppType } from "@/models/types";
import { TeacherType } from "@/models/types/teachers";

type PreviewTeacherHeaderProps = {
    type: ColumnType;
    appType: AppType;
    onTeacherClick?: (teacher: TeacherType) => Promise<void>;
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
    const [isClicked, setIsClicked] = React.useState(false);
    useStickyHeader(headerRef);

    const handleClick = () => {
        if (isClickable && selectedTeacherData?.name && onTeacherClick) {
            setIsClicked(true);
            setTimeout(() => setIsClicked(false), 500);
            onTeacherClick(selectedTeacherData);
        }
    };

    return (
        <div
            ref={headerRef}
            className={`${styles.columnHeaderWrapper} ${isClickable ? styles.clickable : ""}`}
        >
            <div
                className={`${styles.columnHeader} ${isClicked ? styles.clicked : ""}`}
                style={{ backgroundColor: COLOR_BY_TYPE[type] }}
                onClick={handleClick}
                title={isClickable ? "לחצו על שם המורה כדי לראות או להזין את חומרי הלימוד" : undefined}
            >
                <div className={styles.headerText}>{selectedTeacherData?.name || ""}</div>
                {appType === "private" && isClickable && (
                    <Icons.eye className={styles.eyeIcon} size={20} />
                )}
            </div>
        </div>
    );
};

export default PreviewTeacherHeader;
