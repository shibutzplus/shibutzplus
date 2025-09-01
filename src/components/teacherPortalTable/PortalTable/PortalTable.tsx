import React from "react";
import styles from "./PortalTable.module.css";
import { TableRows } from "@/models/constant/table";
import { DailyScheduleType } from "@/models/types/dailySchedule";
import PortalRow from "../PortalRow/PortalRow";

type PortalTableProps = { tableData: DailyScheduleType[] };

const PortalTable: React.FC<PortalTableProps> = ({ tableData }) => {
  // Map rows by hour for O(1) access
  const byHour: Record<number, DailyScheduleType | undefined> = {};
  if (Array.isArray(tableData)) {
    for (const item of tableData) {
      if (item && typeof item.hour === "number") byHour[item.hour] = item;
    }
  }

  return (
    <div className={styles.tableContainer} role="region">
      <table className={styles.scheduleTable}>
        <thead>
          <tr>
            <th></th>
            <th>שיעור</th>
            <th>חומר לימוד</th>
            <th>קישורים</th>
          </tr>
        </thead>
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
