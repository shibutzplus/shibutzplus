import React from "react";
import eventStyles from "../CommonDailySchoolEventCell/CommonDailySchoolEventCell.module.css";
import teacherStyles from "../CommonDailySchoolTeacherCell/CommonDailySchoolTeacherCell.module.css";
import EmptyCell from "@/components/ui/table/EmptyCell/EmptyCell";
import { cellToast } from "@/lib/toast";
import { DailyScheduleCell } from "@/models/types/dailySchedule";
import { getGuardCellDisplayData } from "@/utils/tableUtils";

type CommonDailySchoolGuardCellProps = {
    cell?: DailyScheduleCell;
    teacherMap: Map<string, string>;
};

const CommonDailySchoolGuardCell: React.FC<CommonDailySchoolGuardCellProps> = ({ cell, teacherMap }) => {
    const { title, teachers } = React.useMemo(
        () => getGuardCellDisplayData(cell, teacherMap),
        [cell, teacherMap]
    );

    const [hasScroll, setHasScroll] = React.useState(false);

    const cellRef = React.useCallback((node: HTMLDivElement | null) => {
        if (node) {
            setHasScroll(node.scrollHeight > node.clientHeight);
        }
    }, [title, teachers]);

    const isEmpty = !title && teachers.length === 0;

    const handleClick = () => {
        if (hasScroll) {
            const fullText = [title ? `*${title}*` : "", ...teachers].filter(Boolean).join("\n");
            cellToast(fullText, Infinity);
        }
    };

    return (
        <div className={teacherStyles.cellContent}>
            {isEmpty ? (
                <EmptyCell />
            ) : (
                <div
                    className={`${eventStyles.innerCellContent} ${hasScroll ? eventStyles.hasScroll : ""}`}
                    style={{ gap: "4px" }}
                    ref={cellRef}
                    onClick={handleClick}
                >
                    {title && <div className={teacherStyles.subTeacherName}>{title}</div>}
                    {teachers.map((teacherText, idx) => (
                        <span key={idx} className={teacherStyles.detailText}>
                            {teacherText}
                        </span>
                    ))}
                    {hasScroll && <div className={eventStyles.moreIndicator}>▼</div>}
                </div>
            )}
        </div>
    );
};

export default CommonDailySchoolGuardCell;
