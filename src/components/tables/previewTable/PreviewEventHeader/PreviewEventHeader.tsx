import React from "react";
import { ColumnType, DailyScheduleCell } from "@/models/types/dailySchedule";
import styles from "./PreviewEventHeader.module.css";
import { COLOR_BY_TYPE } from "@/models/constant/daily";
import { useStickyHeader } from "@/hooks/useStickyHeader";

type PreviewEventHeaderProps = {
    type: ColumnType;
    column: {
        [hour: string]: DailyScheduleCell;
    };
};

const PreviewEventHeader: React.FC<PreviewEventHeaderProps> = ({ type, column }) => {
    const selectedEventData = column?.["1"]?.headerCol?.headerEvent;
    const headerRef = React.useRef<HTMLDivElement>(null);
    useStickyHeader(headerRef);

    return (
        <div
            ref={headerRef}
            className={styles.header}
            style={{ backgroundColor: COLOR_BY_TYPE[type] }}
        >
            <div className={styles.headerText}>{selectedEventData || ""}</div>
        </div>
    );
};

export default PreviewEventHeader;
