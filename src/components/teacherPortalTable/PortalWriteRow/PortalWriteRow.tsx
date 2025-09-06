"use client";

import React, { useEffect, useState } from "react";
import styles from "./PortalWriteRow.module.css";
import RichText from "@/components/ui/RichText/RichText";
import { DailyScheduleRequest, DailyScheduleType } from "@/models/types/dailySchedule";
import { HourRowColor } from "@/style/tableColors";
import { usePortal } from "@/context/PortalContext";
import { initDailyCellData } from "@/utils/Initialize";

type PortalWriteRowProps = {
    hour: number;
    row?: DailyScheduleType;
};

const PortalWriteRow: React.FC<PortalWriteRowProps> = ({ hour, row }) => {
    const { handleSave, selectedDate } = usePortal();

    const [instructions, setInstructions] = useState<string>(row?.instructions || "");

    useEffect(() => {
        if (!row) return;
        setInstructions(row.instructions || "");
    }, [row]);

    const handleChange = async (html: string) => {
        if (!row) return;
        const value = html.trim() !== "" ? html.trim() : undefined;
        const dailyCellData: DailyScheduleRequest = initDailyCellData(row, selectedDate, value);

        await handleSave(row.id, dailyCellData);
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
                    <div className={styles.subTeacher}>
                        {row?.subTeacher?.name ?? row?.event ?? ""}
                    </div>
                </div>
            </td>

            <td className={styles.scheduleCellInput}>
                {row ? (
                    <RichText
                        value={instructions}
                        onChangeHTML={setInstructions}
                        onBlurHTML={handleChange}
                        minHeight={80}
                    />
                ) : null}
            </td>
        </tr>
    );
};

export default PortalWriteRow;
