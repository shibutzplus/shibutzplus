import React from "react";
import styles from "./CommonDailySchoolFullTable.module.css";
import { cellToast } from "@/lib/toast";

type CommonDailySchoolFullGuardCellProps = {
    title?: string;
    teachers: string[];
};

const CommonDailySchoolFullGuardCell: React.FC<CommonDailySchoolFullGuardCellProps> = ({ title, teachers }) => {
    const [hasScroll, setHasScroll] = React.useState(false);
    const cellRef = React.useRef<HTMLDivElement>(null);

    const checkOverflow = React.useCallback(() => {
        const node = cellRef.current;
        if (node) {
            setHasScroll(node.scrollHeight > node.clientHeight + 1);
        }
    }, [title, teachers]);

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
            const fullText = [title ? `*${title}*` : "", ...teachers].filter(Boolean).join("\n");
            cellToast(fullText, Infinity);
        }
    };

    return (
        <div
            className={`${styles.cellContent} ${styles.guardCellContent} ${hasScroll ? styles.hasScroll : ""}`}
            ref={cellRef}
            onClick={handleClick}
        >
            {title && <span className={styles.subText}>{title}</span>}
            {teachers.map((teacherText, idx) => (
                <span key={idx} className={styles.detailText}>
                    {teacherText}
                </span>
            ))}
            {hasScroll && <div className={styles.moreIndicator}>▼</div>}
        </div>
    );
};

export default CommonDailySchoolFullGuardCell;
