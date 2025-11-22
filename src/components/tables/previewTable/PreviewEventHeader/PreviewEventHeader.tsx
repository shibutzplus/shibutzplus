import React from "react";
import { useDailyTableContext } from "@/context/DailyTableContext";
import { COLOR_BY_TYPE } from "@/style/tableColors";
import { ColumnType } from "@/models/types/dailySchedule";
import styles from "./PreviewEventHeader.module.css";

type PreviewEventHeaderProps = {
    columnId: string;
    type: ColumnType;
};

const PreviewEventHeader: React.FC<PreviewEventHeaderProps> = ({ columnId, type }) => {
    const { mainDailyTable, selectedDate } = useDailyTableContext();

    const selectedEventData =
        mainDailyTable[selectedDate]?.[columnId]?.["1"]?.headerCol?.headerEvent;

    return (
        <div
            className={styles.header}
            style={{ backgroundColor: COLOR_BY_TYPE[type] }}
        >
            <div className={styles.headerText}>
                {selectedEventData || ""}
            </div>
        </div>
    );
};

export default PreviewEventHeader;
