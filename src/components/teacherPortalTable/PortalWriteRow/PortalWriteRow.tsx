"use client";

import React, { useEffect, useState } from "react";
import styles from "./PortalWriteRow.module.css";
import InputRichText from "@/components/ui/inputs/InputRichText/InputRichText";
import { HourRowColor } from "@/style/tableColors";
import { usePortal } from "@/context/PortalContext";
import { PortalScheduleType } from "@/models/types/portalSchedule";

type PortalWriteRowProps = {
    hour: number;
    row?: PortalScheduleType;
};

const PortalWriteRow: React.FC<PortalWriteRowProps> = ({ hour, row }) => {
    const { teacher, handleSave } = usePortal();

    const [instructions, setInstructions] = useState<string>(row?.instructions || "");
    const [prevInstructions, setPrevInstructions] = useState<string>(row?.instructions || "");

    useEffect(() => {
        if (!row) return;
        setInstructions(row.instructions || "");
    }, [row]);

    const handleChange = async (html: string) => {
        if (!row) return;
        const value = html.trim();
        if (value === prevInstructions) return;
        setPrevInstructions(value);
        await handleSave(row.DBid, hour, value === "" ? undefined : value);
    };

    const replaceTeacher = () => {
        if (row?.issueTeacher) {
            // If Im the issue teacher
            if (teacher?.id === row?.issueTeacher?.id) {
                if (row?.subTeacher) {
                    // If I have sub teacher
                    return `מ״מ: ${row?.subTeacher?.name}`;
                } else if (row?.event) {
                    // If I have activity
                    return row?.event;
                } else {
                    return ""
                }
            } else {
                // Else, Im the sub teacher
                return `מחליף את: ${row?.issueTeacher?.name}`;
            }
        } else {
            return "";
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
                    <div className={styles.subTeacher}>{replaceTeacher()}</div>
                </div>
            </td>
            <td className={styles.scheduleCellInput}>
                {row ? (
                    <InputRichText
                        value={instructions}
                        onChangeHTML={setInstructions}
                        onBlurHTML={handleChange}
                        placeholder="הזינו כאן את חומרי הלימוד"
                        minHeight={80}
                    />
                ) : null}
            </td>
        </tr>
    );
};

export default PortalWriteRow;
