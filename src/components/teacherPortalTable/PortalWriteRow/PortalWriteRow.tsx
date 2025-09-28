"use client";

import React, { useEffect, useState } from "react";
import InputRichText from "@/components/ui/inputs/InputRichText/InputRichText";
import { usePortal } from "@/context/PortalContext";
import { HourRowColor } from "@/style/tableColors";
import { PortalScheduleType } from "@/models/types/portalSchedule";
import styles from "./PortalWriteRow.module.css";

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

    // Save changes only if the value actually changed
    const handleChange = async (html: string) => {
        if (!row) return;
        const value = html.trim();
        if (value === prevInstructions) return;
        setPrevInstructions(value);
        await handleSave(row.DBid, hour, value === "" ? undefined : value);
    };

    // Returns text about replacement teacher or event
    const replaceTeacher = () => {
        if (row?.issueTeacher) {
            if (teacher?.id === row?.issueTeacher?.id) {
                if (row?.subTeacher) return `${row?.subTeacher?.name}`;
                if (row?.event) return row?.event;
                return "";
            } else {
                return `במקום ${row?.issueTeacher?.name}`;
            }
        }
        return "";
    };

    // Decide what placeholder to show inside the input
    const getInstructionPlaceholder = () => {
        if (!row || !teacher) return "חומר הלימוד";

        const isIssueTeacher = teacher.id === row.issueTeacher?.id;
        const isSubTeacher = teacher.id === row.subTeacher?.id;

        // If I am the main teacher:
        // Show "הזינו חומר לימוד" only if there is a sub teacher.
        // If no sub teacher exists → show nothing.
        if (isIssueTeacher) {
            return row.subTeacher ? "הזינו את חומר הלימוד" : "";
        }

        // If I am the substitute teacher → waiting for material
        if (isSubTeacher) {
            return "ממתין לחומר הלימוד";
        }

        // Default for all others
        return "חומר הלימוד";
    };

    const placeholder = getInstructionPlaceholder();
    const isIssueTeacher = teacher?.id === row?.issueTeacher?.id;

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
                        placeholder={placeholder}
                        minHeight={60}
                        importantPlaceholder={isIssueTeacher && !!row.subTeacher} // red only when I am the issue teacher and there is a sub teacher
                    />
                ) : null}
            </td>
        </tr>
    );
};

export default PortalWriteRow;
