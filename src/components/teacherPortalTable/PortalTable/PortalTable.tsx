import React, { useMemo } from "react";
import styles from "./PortalTable.module.css";
import { TableRows } from "@/models/constant/table";
import { DailyScheduleType } from "@/models/types/dailySchedule";
import PortalWriteRow from "../PortalWriteRow/PortalWriteRow";
import PortalReadRow from "../PortalReadRow/PortalReadRow";

type PortalTableProps = {
    tableData: DailyScheduleType[] | undefined;
    mode: "read" | "write";
};

const PortalTable: React.FC<PortalTableProps> = ({ tableData = [], mode }) => {
    const byHour = useMemo(() => {
        return tableData.reduce<Record<number, DailyScheduleType>>((acc, item) => {
            if (item?.hour && typeof item.hour === "number") {
                acc[item.hour] = item;
            }
            return acc;
        }, {});
    }, [tableData]);

    return (
        <div className={styles.tableContainer} role="region">
            <table className={styles.scheduleTable}>
                <thead>
                    <tr>
                        <th></th>
                        <th>שיעור</th>
                        <th>חומר לימוד</th>
                    </tr>
                </thead>
                <tbody>
                    {Array.from({ length: TableRows }, (_, i) => i + 1).map((hour) => {
                        const row = byHour[hour];
                        return mode === "read" ? (
                            <PortalReadRow key={hour} hour={hour} row={row} />
                        ) : (
                            <PortalWriteRow key={hour} hour={hour} row={row} />
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
};

export default PortalTable;
