import React, { useState } from "react";
import styles from "./PortalRow.module.css";
import InputText from "@/components/ui/InputText/InputText";
import { DailyScheduleType } from "@/models/types/dailySchedule";
import { HourRowColor } from "@/style/tableColors";
import { PortalScheduleType } from "@/models/types/portalSchedule";

type PortalRowProps = {
    hour: number;
    row: DailyScheduleType | undefined;
};

const PortalRow: React.FC<PortalRowProps> = ({ hour, row }) => {
    const [instructions, setInstructions] = useState<string>(row?.instructions || "");
    const [links, setLinks] = useState<string>(row?.links || "");

    const handleChange = (value: string) => {
        if (value.trim()) {
            const rowData: PortalScheduleType = {
                hour,
                school: row?.school,
                class: row?.class,
                subject: row?.subject,
                subTeacher: row?.subTeacher,
                instructions: value,
                links: links,
            };
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
                        key="instructions"
                        id={String("instructions")}
                        name={String("instructions")}
                        value={instructions}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            setInstructions(e.target.value)
                        }
                        onBlur={(e) => handleChange(e.target.value)}
                        placeholder="הוספת חומרי לימוד והוראות"
                        type="text"
                    />
                ) : null}
            </td>
            <td className={styles.scheduleCellInput}>
                {row ? (
                    <InputText
                        key="links"
                        id={String("links")}
                        name={String("links")}
                        value={links}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            setLinks(e.target.value)
                        }
                        onBlur={(e) => handleChange(e.target.value)}
                        placeholder="הוספת קישורים רלוונטים"
                        type="text"
                    />
                ) : null}
            </td>
        </tr>
    );
};

export default PortalRow;
