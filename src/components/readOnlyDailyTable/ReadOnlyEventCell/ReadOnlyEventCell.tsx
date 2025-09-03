import React from "react";
import styles from "./ReadOnlyEventCell.module.css";
import { DailyScheduleType } from "@/models/types/dailySchedule";

type ReadOnlyEventCellProps = {
    cellData: DailyScheduleType;
};

const ReadOnlyEventCell: React.FC<ReadOnlyEventCellProps> = ({ cellData }) => {
    return (
        <div className={styles.eventCell}>
            <div className={styles.eventText}>{cellData.event}</div>
        </div>
    );
};

export default ReadOnlyEventCell;
