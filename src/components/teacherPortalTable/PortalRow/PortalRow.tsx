import React, { useState } from "react";
import styles from "./PortalRow.module.css";
import InputText from "@/components/ui/InputText/InputText";
import { DailyScheduleType } from "@/models/types/dailySchedule";
import { HourRowColor } from "@/style/tableColors";
import { usePublicPortal } from "@/context/PublicPortalContext";

type PortalRowProps = {
    hour: number;
    row: DailyScheduleType | undefined;
};

const PortalRow: React.FC<PortalRowProps> = ({ hour, row }) => {
    const { updateRowDetails, onReadTable } = usePublicPortal();
    const [instructions, setInstructions] = useState<string>(row?.instructions || "");
    const [links, setLinks] = useState<string>(row?.links || "");

    const handleChange = (type: "instructions" | "links", value: string) => {
        if (value.trim() && row && !onReadTable) {
            const change = {
                instructions: type === "instructions" ? value : instructions,
                links: type === "links" ? value : links,
            }
            updateRowDetails(row, change);
        }
    };


    return (
        <tr key={hour}>
            <td className={styles.hourCell} style={{ backgroundColor: HourRowColor }}>
                {hour}
            </td>
            <td className={styles.scheduleCell}>
                <div className={styles.cellContent}>{row?.class?.name || ""}</div>
            </td>
            <td className={styles.scheduleCell}>
                <div className={styles.cellContent}>{row?.subTeacher?.name || ""}</div>
            </td>
            <td className={styles.scheduleCell}>
                <div className={styles.cellContent}>{row?.subject?.name || ""}</div>
            </td>
            <td className={styles.scheduleCellInput}>
                {row ? (
                    <InputText
                        key="instruction"
                        id={"instructions"}
                        name={"instructions"}
                        value={instructions}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            setInstructions(e.target.value)
                        }
                        onBlur={(e) => handleChange("instructions", e.target.value)}
                        placeholder={onReadTable ? "עדיין לא נוספו חומרי עזר" : "הוספת חומרי לימוד והוראות"}
                        type="text"
                        readonly={onReadTable}
                    />
                ) : null}
            </td>
            <td className={styles.scheduleCellInput}>
                {row ? (
                    <InputText
                        key="link"
                        id={"links"}
                        name={"links"}
                        value={links}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            setLinks(e.target.value)
                        }
                        onBlur={(e) => handleChange("links", e.target.value)}
                        placeholder={onReadTable ? "עדיין לא נוספו קישורים" : "הוספת קישורים רלוונטים"}
                        type="text"
                        readonly={onReadTable}
                    />
                ) : null}
            </td>
        </tr>
    );
};

export default PortalRow;
