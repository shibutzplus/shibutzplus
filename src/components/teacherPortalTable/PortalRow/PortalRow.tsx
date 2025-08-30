import React, { useState } from "react";
import styles from "./PortalRow.module.css";
import InputTextArea from "@/components/ui/InputTextArea/InputTextArea";
import { DailyScheduleType } from "@/models/types/dailySchedule";
import { HourRowColor } from "@/style/tableColors";
import { usePublicPortal } from "@/context/PublicPortalContext";

type PortalRowProps = { hour: number; row: DailyScheduleType | undefined };

const PortalRow: React.FC<PortalRowProps> = ({ hour, row }) => {
  const { updateRowDetails, onReadTable } = usePublicPortal();
  const [instructions, setInstructions] = useState<string>(row?.instructions || "");
  const [links, setLinks] = useState<string>(row?.links || "");

  const handleChange = (type: "instructions" | "links", value: string) => {
    if (row && !onReadTable) {
      updateRowDetails(row, {
        instructions: type === "instructions" ? value : instructions,
        links: type === "links" ? value : links,
      });
    }
  };

  return (
    <tr>
      <td className={styles.hourCell} style={{ backgroundColor: HourRowColor }}>
        {hour}
      </td>

      <td className={styles.scheduleCell}>
        <div className={styles.cellContent}>
          <div className={styles.className}>{row?.class?.name ?? ""}</div>
          <div className={styles.subjectName}>{row?.subject?.name ?? ""}</div>
          <div style={{ height: "6px" }}></div>
          <div className={styles.subTeacher}>{row?.subTeacher?.name ?? ""}</div>
        </div>
      </td>

      <td className={styles.scheduleCellInput}>
        {row && (
          <InputTextArea
            id={`instructions-${hour}`}
            name="instructions"
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            onBlur={(e) => handleChange("instructions", e.target.value)}
            placeholder={onReadTable ? "לא נוספו חומרי לימוד" : "חומר לימוד"}
            disabled={onReadTable}
            rows={1}
            autoGrow
          />
        )}
      </td>

      <td className={styles.scheduleCellInput}>
        {row && (
          <InputTextArea
            id={`links-${hour}`}
            name="links"
            value={links}
            onChange={(e) => setLinks(e.target.value)}
            onBlur={(e) => handleChange("links", e.target.value)}
            placeholder={onReadTable ? "לא נוספו קישורים" : "קישורים"}
            disabled={onReadTable}
            rows={1}
            autoGrow
          />
        )}
      </td>
    </tr>
  );
};

export default PortalRow;
