import React from "react";
import styles from "./PreviewEventCell.module.css";
import { DailyScheduleCell } from "@/models/types/dailySchedule";
import EmptyCell from "@/components/ui/table/EmptyCell/EmptyCell";
import { cellToast } from "@/lib/toast";

type PreviewEventCellProps = {
    columnId: string;
    cell: DailyScheduleCell;
};

const PreviewEventCell: React.FC<PreviewEventCellProps> = ({ cell }) => {
    const eventData = cell?.event;

    const [hasScroll, setHasScroll] = React.useState(false);

    const cellRef = React.useCallback((node: HTMLDivElement | null) => {
        if (node) {
            setHasScroll(node.scrollHeight > node.clientHeight);
        }
    }, [eventData]); // Add dependency to re-check if data changes

    const handleClick = () => {
        if (hasScroll && eventData) {
            cellToast(eventData, Infinity);
        }
    };

    return (
        <div className={styles.cellContent}>
            {eventData ? (
                <div
                    className={`${styles.innerCellContent} ${hasScroll ? styles.hasScroll : ""}`}
                    ref={cellRef}
                    onClick={handleClick}
                >
                    <div className={styles.eventText}>{eventData}</div>
                    {hasScroll && <div className={styles.moreIndicator}>▼</div>}
                </div>
            ) : (
                <EmptyCell />
            )}
        </div>
    );
};

export default PreviewEventCell;
