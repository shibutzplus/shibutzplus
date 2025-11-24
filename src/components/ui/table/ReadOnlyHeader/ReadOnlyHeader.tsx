import React from "react";
import styles from "./ReadOnlyHeader.module.css";
import { DailyScheduleType } from "@/models/types/dailySchedule";

type ReadOnlyHeaderProps = {
    trs: any[];
    emptyTrs?: number;
    textPlaceholder: (text: string) => string;
    hasHour?: boolean;
};

type Tr = {
    title: string;
    color?: string;
    type?: DailyScheduleType;
    teacherId?: string;
};
//MOVE TO ANNUAL HEADER
const ReadOnlyHeader: React.FC<ReadOnlyHeaderProps> = ({
    trs,
    emptyTrs = 0,
    textPlaceholder,
    hasHour = false,
}) => {
    return (
        <thead className={styles.thead}>
            <tr>
                {hasHour ? <th className={styles.hourCol}>{/* "Hour" column */}</th> : null}
                {Array.from({ length: emptyTrs }, (_, i) => i).map((i) => (
                    <th key={i} className={styles.emptyTrHeader}></th>
                ))}
                {trs.map((tr: any) => (
                    <th key={tr} className={`${styles.trHeader} ${tr as Tr}`}>
                        {textPlaceholder(tr)}
                    </th>
                ))}
            </tr>
        </thead>
    );
};

export default ReadOnlyHeader;
