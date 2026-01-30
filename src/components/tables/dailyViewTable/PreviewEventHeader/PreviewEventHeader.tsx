import React from "react";
import { ColumnType, DailyScheduleCell } from "@/models/types/dailySchedule";
import { AppType } from "@/models/types";
import styles from "./PreviewEventHeader.module.css";
import { COLOR_BY_TYPE } from "@/models/constant/daily";
import { useStickyHeader } from "@/hooks/scroll/useStickyHeader";
import { useColumnClipboard } from "@/context/ColumnClipboardContext";
import { successToast } from "@/lib/toast";
import PreviewHeaderMenu from "../PreviewHeaderMenu/PreviewHeaderMenu";

type PreviewEventHeaderProps = {
    type: ColumnType;
    appType: AppType;
    column: {
        [hour: string]: DailyScheduleCell;
    };
};

const PreviewEventMenu: React.FC<{
    type: ColumnType;
    column: { [hour: string]: DailyScheduleCell };
}> = ({ type, column }) => {
    const { copyColumn } = useColumnClipboard();

    const handleCopy = () => {
        copyColumn(type, column);
        successToast("תוכן העמודה הועתק, אפשר להדביק בשיבוץ היומי", 2000);
    };

    return (
        <div className={styles.menuContainer}>
            <PreviewHeaderMenu
                onCopy={handleCopy}
                showViewMaterial={false}
            />
        </div>
    );
};

const PreviewEventHeader: React.FC<PreviewEventHeaderProps> = ({ type, column, appType }) => {
    const selectedEventData = column?.["1"]?.headerCol?.headerEvent;
    const headerRef = React.useRef<HTMLDivElement>(null);
    useStickyHeader(headerRef);

    const showMenu = appType === "private";

    return (
        <div ref={headerRef} className={styles.columnHeaderWrapper}>
            <div className={styles.columnHeader} style={{ backgroundColor: COLOR_BY_TYPE[type] }}>
                {showMenu && (
                    <PreviewEventMenu type={type} column={column} />
                )}
                <div className={styles.headerText}>{selectedEventData || ""}</div>
            </div>
        </div>
    );
};

export default PreviewEventHeader;
