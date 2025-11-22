import React from "react";
import styles from "./ViewEventCell.module.css";
import { DailyScheduleType } from "@/models/types/dailySchedule";

// NOT IN USE
type ViewEventCellProps = {
    cellData: DailyScheduleType;
};

const ViewEventCell: React.FC<ViewEventCellProps> = ({ cellData }) => {
    return (
        <div className={styles.eventCell}>
            <div className={styles.eventText}>{cellData.event}</div>
        </div>
    );
};

export default ViewEventCell;
