import React from "react";
import styles from "./DailyFullScreenTable.module.css";
import { cellToast } from "@/lib/toast";

type DailyFullScreenEventCellProps = {
    eventText: string;
};

const DailyFullScreenEventCell: React.FC<DailyFullScreenEventCellProps> = ({ eventText }) => {
    const [hasScroll, setHasScroll] = React.useState(false);

    const checkOverflow = React.useCallback(() => {
        const node = cellRef.current;
        if (node) {
            setHasScroll(node.scrollHeight > node.clientHeight + 1);
        }
    }, [eventText]);

    const cellRef = React.useRef<HTMLDivElement>(null);

    React.useLayoutEffect(() => {
        const node = cellRef.current;
        if (!node) return;

        checkOverflow();

        const observer = new ResizeObserver(checkOverflow);
        observer.observe(node);

        return () => observer.disconnect();
    }, [checkOverflow]);

    const handleClick = () => {
        if (hasScroll) {
            cellToast(eventText, Infinity);
        }
    };

    return (
        <div
            className={`${styles.eventCellContent} ${hasScroll ? styles.hasScroll : ""}`}
            ref={cellRef}
            onClick={handleClick}
        >
            <span className={styles.eventText}>
                {eventText}
            </span>
            {hasScroll && <div className={styles.moreIndicator}>▼</div>}
        </div>
    );
};

export default DailyFullScreenEventCell;
