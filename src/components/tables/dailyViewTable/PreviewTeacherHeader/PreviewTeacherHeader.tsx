import React from "react";
import { ColumnType, DailyScheduleCell } from "@/models/types/dailySchedule";
import styles from "./PreviewTeacherHeader.module.css";
import { COLOR_BY_TYPE } from "@/models/constant/daily";
import { useStickyHeader } from "@/hooks/scroll/useStickyHeader";
import { AppType } from "@/models/types";
import { TeacherType } from "@/models/types/teachers";
import { useTeacherTableContext } from "@/context/TeacherTableContext";

type PreviewTeacherHeaderProps = {
    type: ColumnType;
    appType: AppType;
    selectedDate: string;
    onTeacherClick?: (teacher: TeacherType) => Promise<void>;
    column: {
        [hour: string]: DailyScheduleCell;
    };
};

const PreviewTeacherHeader: React.FC<PreviewTeacherHeaderProps> = ({
    type,
    column,
    appType,
    selectedDate,
    onTeacherClick,
}) => {
    const { fetchTeacherScheduleDate } = useTeacherTableContext();
    const selectedTeacherData = column?.["1"]?.headerCol?.headerTeacher;
    const isClickable = !!selectedTeacherData?.name;
    const headerRef = React.useRef<HTMLDivElement>(null);
    const [isClicked, setIsClicked] = React.useState(false);
    useStickyHeader(headerRef);

    const handleClick = async () => {
        if (isClickable && selectedTeacherData?.name && onTeacherClick) {
            setIsClicked(true);
            onTeacherClick(selectedTeacherData);
            await fetchTeacherScheduleDate(selectedTeacherData, selectedDate);
            setIsClicked(false);
        }
    };

    return (
        <div
            ref={headerRef}
            className={`${styles.columnHeaderWrapper} ${isClickable && appType === "private" ? styles.clickable : ""
                }`}
        >
            <div
                className={`${styles.columnHeader} ${isClicked ? styles.clicked : ""}`}
                style={{ backgroundColor: COLOR_BY_TYPE[type] }}
                onClick={handleClick}
            >

                <div className={styles.headerText}>{selectedTeacherData?.name || ""}</div>
            </div>
        </div>
    );
};

export default PreviewTeacherHeader;
