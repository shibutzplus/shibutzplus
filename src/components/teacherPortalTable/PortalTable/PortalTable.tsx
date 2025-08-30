import React from "react";
import styles from "./PortalTable.module.css";
import { TableRows } from "@/models/constant/table";
import { DailyScheduleType } from "@/models/types/dailySchedule";
import PortalRow from "../PortalRow/PortalRow";
import { useResizableColumns, ResizableTH } from "@/hooks/useResizableColumns";

type PortalTableProps = { tableData: DailyScheduleType[] };

const PortalTable: React.FC<PortalTableProps> = ({ tableData }) => {
  // Map rows by hour
  const byHour: Record<number, (typeof tableData)[0] | undefined> = {};
  if (Array.isArray(tableData)) {
    for (const item of tableData) {
      if (item && typeof item.hour === "number") byHour[item.hour] = item;
    }
  }

  const { tableRef, ColGroup, handleProps } = useResizableColumns({
    count: 4,
    initial: [56, 260, 320, 160],
    min: 48,
    max: 600,
  });

  return (
    <div className={styles.tableContainer} role="region">
      <table ref={tableRef} className={styles.scheduleTable}>
        <ColGroup />
        <thead>
          <tr>
            <ResizableTH index={0} handleProps={handleProps}>שעה</ResizableTH>
            <ResizableTH index={1} handleProps={handleProps}>שיעור</ResizableTH>
            <ResizableTH index={2} handleProps={handleProps}>חומר לימוד</ResizableTH>
            <ResizableTH index={3} handleProps={handleProps}>קישורים</ResizableTH>
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
