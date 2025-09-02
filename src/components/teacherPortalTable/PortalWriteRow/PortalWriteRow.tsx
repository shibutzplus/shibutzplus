import React, { useEffect, useState } from "react";
import styles from "./PortalWriteRow.module.css";
import InputTextArea from "@/components/ui/InputTextArea/InputTextArea";
import { DailyScheduleRequest, DailyScheduleType } from "@/models/types/dailySchedule";
import { HourRowColor } from "@/style/tableColors";
import { usePublicPortal } from "@/context/PublicPortalContext";
import { initDailyCellData } from "@/utils/Initialize";

type PortalWriteRowProps = {
    hour: number;
    row?: DailyScheduleType;
};

const PortalWriteRow: React.FC<PortalWriteRowProps> = ({ hour, row }) => {
    const { handleSave, selectedDate } = usePublicPortal();

    const [instructions, setInstructions] = useState<string>(row?.instructions || "");
    const [previewInstructions, setPreviewInstructions] = useState<string>(row?.instructions || "");
    const [links, setLinks] = useState<string>(row?.links || "");
    const [previewLinks, setPreviewLinks] = useState<string>(row?.links || "");

    useEffect(() => {
        if (row) {
            setInstructions(row.instructions || "");
            setLinks(row.links || "");
        }
    }, [row]);

    const handleChange = async (type: "instructions" | "links", value: string) => {
        if (row) {
            // Prevent update the same text
            if(type === "instructions" && value === previewInstructions) return
            if(type === "links" && value === previewLinks) return

            const v = value.trim() !== "" ? value.trim() : undefined;
            const instractionsRes = type === "instructions" ? v : instructions;
            const linksRes = type === "links" ? v : links;
            const dailyCellData: DailyScheduleRequest = initDailyCellData(
                row,
                selectedDate,
                instractionsRes,
                linksRes,
            );
            setPreviewInstructions(v || "");
            setPreviewLinks(v || "");
            await handleSave(row.id, dailyCellData);
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
                        placeholder={"חומר לימוד"}
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
                        placeholder={"קישורים"}
                        rows={1}
                        autoGrow
                    />
                )}
            </td>
        </tr>
    );
};

export default PortalWriteRow;
