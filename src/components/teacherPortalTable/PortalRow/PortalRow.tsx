import React, { useState } from "react";
import styles from "./PortalRow.module.css";
import InputTextArea from "@/components/ui/InputTextArea/InputTextArea";
import { DailyScheduleType } from "@/models/types/dailySchedule";
import { HourRowColor } from "@/style/tableColors";
import { usePublicPortal } from "@/context/PublicPortalContext";

type PortalRowProps = { hour: number; row: DailyScheduleType | undefined; };

const PortalRow: React.FC<PortalRowProps> = ({ hour, row }) => {
  const { updateRowDetails, onReadTable } = usePublicPortal();
  const [instructions, setInstructions] = useState<string>(row?.instructions || "");
  const [links, setLinks] = useState<string>(row?.links || "");

  const handleChange = (type: "instructions" | "links", value: string) => {
    if (value.trim() && row && !onReadTable) {
      updateRowDetails(row, {
        instructions: type === "instructions" ? value : instructions,
        links: type === "links" ? value : links,
      });
    }
  };

  return (
    <tr key={hour}>
      <td className={styles.hourCell} style={{ backgroundColor: HourRowColor }}>{hour}</td>

      <td className={styles.scheduleCell}><div className={styles.cellContent}>{row?.class?.name || ""}</div></td>
      <td className={styles.scheduleCell}><div className={styles.cellContent}>{row?.subTeacher?.name || ""}</div></td>
      <td className={styles.scheduleCell}><div className={styles.cellContent}>{row?.subject?.name || ""}</div></td>

      <td className={styles.scheduleCellInput}>
        {row && (
          <InputTextArea
            id="instructions"
            name="instructions"
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            onBlur={(e) => handleChange("instructions", e.target.value)}
            placeholder={onReadTable ? "עדיין לא נוספו חומרי לימוד" : "הוספת חומרי לימוד והנחיות"}
            disabled={onReadTable}
            rows={1}
            autoGrow
          />
        )}
      </td>

      <td className={styles.scheduleCellInput}>
        {row && (
          <InputTextArea
            id="links"
            name="links"
            value={links}
            onChange={(e) => setLinks(e.target.value)}
            onBlur={(e) => handleChange("links", e.target.value)}
            placeholder={onReadTable ? "לא נוספו קישורים" : "הוספת קישורים רלוונטים"}
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
