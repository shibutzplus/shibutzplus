import React from "react";
import styles from "./PortalTable.module.css";
import { TableRows } from "@/models/constant/table";
import { DailyScheduleType } from "@/models/types/dailySchedule";
import PortalRow from "../PortalRow/PortalRow";
import { useResizableColumns, ResizableTH } from "@/hooks/useResizableColumns"; // <- import

type PortalTableProps = {
  tableData: DailyScheduleType[];
};

const PortalTable: React.FC<PortalTableProps> = ({ tableData }) => {
  const trs = ["כיתה", "מורה מחליף", "מקצוע", "חומר לימוד", "קישורים"];

  // Map rows by hour
  const byHour: Record<number, (typeof tableData)[0] | undefined> = {};
  if (Array.isArray(tableData)) {
    for (const item of tableData) {
      if (item && typeof item.hour === "number") byHour[item.hour] = item;
    }
  }

  // 6 columns total: hour + 5 fields
  const { tableRef, ColGroup, handleProps } = useResizableColumns({
    count: 6,
    initial: [40, 40, 60, 60, 320, 160],
    min: 40,
    max: 500,
  });

  return (
    <div className={styles.tableContainer} role="region">
      <table ref={tableRef} className={styles.scheduleTable}>
        <ColGroup/>
        <thead>
          <tr>
            <ResizableTH index={0} handleProps={handleProps}>שעה</ResizableTH>
            <ResizableTH index={1} handleProps={handleProps}>כיתה</ResizableTH>
            <ResizableTH index={2} handleProps={handleProps}>מורה מחליף</ResizableTH>
            <ResizableTH index={3} handleProps={handleProps}>מקצוע</ResizableTH>
            <ResizableTH index={4} handleProps={handleProps}>חומר לימוד</ResizableTH>
            <ResizableTH index={5} handleProps={handleProps}>קישורים</ResizableTH>
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
