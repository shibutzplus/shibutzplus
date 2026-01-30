import React from "react";
import { ColumnType, DailyScheduleCell } from "@/models/types/dailySchedule";
import styles from "./PreviewTeacherHeader.module.css";
import { COLOR_BY_TYPE } from "@/models/constant/daily";
import { useStickyHeader } from "@/hooks/scroll/useStickyHeader";
import { AppType } from "@/models/types";
import { TeacherType } from "@/models/types/teachers";
import { useTeacherTableContext } from "@/context/TeacherTableContext";
import PreviewHeaderMenu from "../PreviewHeaderMenu/PreviewHeaderMenu";

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
    useStickyHeader(headerRef);

    const handleViewMaterial = async () => {
        if (isClickable && selectedTeacherData?.name && onTeacherClick) {
            onTeacherClick(selectedTeacherData);
            await fetchTeacherScheduleDate(selectedTeacherData, selectedDate);
        }
    };

    // Only show menu in private app mode (history screen)
    const showMenu = appType === "private" && isClickable;

    return (
        <div
            ref={headerRef}
            className={styles.columnHeaderWrapper}
        >
            <div
                className={styles.columnHeader}
                style={{ backgroundColor: COLOR_BY_TYPE[type] }}
            >
                {showMenu && (
                    <div className={styles.menuContainer}>
                        <PreviewHeaderMenu
                            onViewMaterial={handleViewMaterial}
                            showViewMaterial={true}
                        />
                    </div>
                )}
                <div className={styles.headerText}>{selectedTeacherData?.name || ""}</div>
            </div>
        </div>
    );
};

export default PreviewTeacherHeader;
