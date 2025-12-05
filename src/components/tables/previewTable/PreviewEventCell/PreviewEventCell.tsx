import React from "react";
import styles from "./PreviewEventCell.module.css";
import { DailyScheduleCell } from "@/models/types/dailySchedule";
import EmptyCell from "@/components/ui/table/EmptyCell/EmptyCell";

type PreviewEventCellProps = {
    columnId: string;
    cell: DailyScheduleCell;
};

const PreviewEventCell: React.FC<PreviewEventCellProps> = ({ cell }) => {
    const eventData = cell?.event;

    return (
        <div className={styles.cellContent}>
            {eventData ? (
                <div className={styles.innerCellContent}>
                    <div className={styles.eventText}>{eventData}</div>
                </div>
            ) : (
                <EmptyCell />
            )}
        </div>
    );
};

export default PreviewEventCell;
