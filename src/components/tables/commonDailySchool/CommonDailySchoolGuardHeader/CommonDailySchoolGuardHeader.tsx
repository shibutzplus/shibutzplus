import React from "react";
import { DailyScheduleCell } from "@/models/types/dailySchedule";
import { AppType } from "@/models/types";
import styles from "./CommonDailySchoolGuardHeader.module.css";
import { GuardColor } from "@/style/root";
import { DEFAULT_GUARD_TITLE } from "@/models/constant/daily";
import { useStickyHeader } from "@/hooks/scroll/useStickyHeader";
import { useColumnClipboard } from "@/context/ColumnClipboardContext";
import { ColumnTypeValues } from "@/models/types/dailySchedule";
import { successToast } from "@/lib/toast";
import CommonDailySchoolHeaderMenu from "../CommonDailySchoolHeaderMenu/CommonDailySchoolHeaderMenu";

type CommonDailySchoolGuardHeaderProps = {
    appType: AppType;
    column: {
        [hour: string]: DailyScheduleCell;
    };
};

const CommonDailySchoolGuardMenu: React.FC<{
    column: { [hour: string]: DailyScheduleCell };
}> = ({ column }) => {
    const { copyColumn } = useColumnClipboard();
    const headerCell = Object.values(column || {}).find(c => c?.headerCol?.headerEvent);
    const selectedEventData = headerCell?.headerCol?.headerEvent;

    const handleCopy = () => {
        copyColumn(ColumnTypeValues.guard, column);
        successToast("תוכן העמודה הועתק, אפשר להדביק בשיבוץ היומי", 1800);
    };

    return (
        <div className={styles.menuContainer}>
            <CommonDailySchoolHeaderMenu
                onCopy={handleCopy}
                showViewMaterial={false}
                disableCopy={!selectedEventData || selectedEventData.trim() === ""}
            />
        </div>
    );
};

const CommonDailySchoolGuardHeader: React.FC<CommonDailySchoolGuardHeaderProps> = ({ column, appType }) => {
    const headerCell = Object.values(column || {}).find(c => c?.headerCol?.headerEvent);
    const selectedEventData = headerCell?.headerCol?.headerEvent || DEFAULT_GUARD_TITLE;
    const headerRef = React.useRef<HTMLDivElement>(null);
    useStickyHeader(headerRef);

    const showMenu = appType === "private";

    return (
        <div ref={headerRef} className={styles.columnHeaderWrapper}>
            <div className={styles.columnHeader} style={{ backgroundColor: GuardColor }}>
                {showMenu && (
                    <CommonDailySchoolGuardMenu column={column} />
                )}
                <div className={styles.headerText}>{selectedEventData}</div>
            </div>
        </div>
    );
};

export default CommonDailySchoolGuardHeader;
