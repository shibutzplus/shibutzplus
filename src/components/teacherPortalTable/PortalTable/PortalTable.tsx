import React from "react";
import styles from "./PortalTable.module.css";
import ReadOnlyHeader from "@/components/ui/table/ReadOnlyHeader/ReadOnlyHeader";
import { TableRows } from "@/models/constant/table";
import { DailyScheduleType } from "@/models/types/dailySchedule";
import PortalRow from "../PortalRow/PortalRow";

type PortalTableProps = {
    tableData: DailyScheduleType[];
};

const PortalTable: React.FC<PortalTableProps> = ({ tableData }) => {
    const trs = ["כיתה", "מורה מחליף", "מקצוע", "חומר לימוד", "קישורים"];

    const byHour: Record<number, (typeof tableData)[0] | undefined> = {};
    if (Array.isArray(tableData)) {
        for (const item of tableData) {
            if (item && typeof item.hour === "number") byHour[item.hour] = item;
        }
    }

    return (
        <div className={styles.tableContainer}>
            <table className={styles.scheduleTable}>
                <ReadOnlyHeader trs={trs} textPlaceholder={(text) => text} hasHour />
                <tbody>
                    {Array.from({ length: TableRows }, (_, i) => i + 1).map((hour) => {
                        const row = byHour[hour];
                        return <PortalRow key={hour} hour={hour} row={row} />;
                    })}
                </tbody>
            </table>
        </div>
    );
};

export default PortalTable;
