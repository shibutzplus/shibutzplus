import React from "react";
import styles from "./PortalReadRow.module.css";
import { DailyScheduleType } from "@/models/types/dailySchedule";
import { HourRowColor } from "@/style/tableColors";
import MarkDown from "@/components/ui/MarkDown/MarkDown";

type PortalReadRowProps = { hour: number; row: DailyScheduleType | undefined };

const PortalReadRow: React.FC<PortalReadRowProps> = ({ hour, row }) => {
    return (
        <tr>
            <td className={styles.hourCell} style={{ backgroundColor: HourRowColor }}>
                {hour}
            </td>

            <td className={styles.scheduleCell}>
                <div className={styles.cellContent}>
                    <div className={styles.class}>{row?.class?.name ?? ""}</div>
                    <div className={styles.subjectName}>{row?.subject?.name ?? ""}</div>
                </div>
            </td>

            <td className={styles.scheduleCell}>
                <MarkDown instructions={row?.instructions || ""} />
            </td>
        </tr>
    );
};

export default PortalReadRow;
