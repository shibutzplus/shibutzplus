"use client";

import React, { useEffect, useState } from "react";
import InputRichText from "@/components/ui/inputs/InputRichText/InputRichText";
import { usePortalContext } from "@/context/PortalContext";
import { TeacherScheduleType } from "@/models/types/portalSchedule";
import styles from "./PortalWriteRow.module.css";

type PortalWriteRowProps = {
    hour: number;
    row?: TeacherScheduleType;
};

const PortalWriteRow: React.FC<PortalWriteRowProps> = ({ hour, row }) => {
    const { teacher } = usePortalContext();
    // const { handleSave } = usePortalActions();

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

        const schoolId = row.schoolId ?? row.school?.id;
        const issueTeacherId = row.issueTeacher?.id ?? undefined;
        const subTeacherId = row.subTeacher?.id ?? undefined;

        // await handleSave(
        //     row.DBid,
        //     hour,
        //     value === "" ? undefined : value,
        //     schoolId,
        //     issueTeacherId,
        //     subTeacherId,
        // );
    };

    // Returns text about replacement teacher or event
    // const replaceTeacher = () => {
    //     if (row?.issueTeacher) {
    //         if (teacher?.id === row?.issueTeacher?.id) {
    //             if (row?.subTeacher) return `${row?.subTeacher?.name}`;
    //             if (row?.event) return row?.event;
    //             return "";
    //         } else {
    //             return `במקום ${row?.issueTeacher?.name}`;
    //         }
    //     }
    //     return "";
    // };

    // Decide what placeholder to show inside the input
    const getInstructionPlaceholder = () => {
        if (!row || !teacher) return "חומר הלימוד";

        const isIssueTeacher = teacher.id === row.issueTeacher?.id;
        const isSubTeacher = teacher.id === row.subTeacher?.id;

        // If I am the main teacher
        if (isIssueTeacher) {
            return row.subTeacher ? "הזינו כאן את חומר הלימוד" : "";
        }

        // If I am the substitute teacher
        if (isSubTeacher) {
            return "לא הוזן חומר לימוד לשיעור זה";
        }

        // Default for all others
        return "חומר הלימוד";
    };

    const placeholder = getInstructionPlaceholder();
    const isIssueTeacher = teacher?.id === row?.issueTeacher?.id;

    return (
        <tr>
            {/* <td className={styles.hourCell} style={{ backgroundColor: "#fffbf5" }}>
                {hour}
            </td>
            <td className={styles.cellClass}>
                <div className={styles.cellContent}>
                    <div className={styles.className}>{row?.class?.name ?? ""}</div>
                    <div className={styles.subjectName}>{row?.subject?.name ?? ""}</div>
                    <div className={styles.subTeacher}>{replaceTeacher()}</div>
                </div>
            </td> */}
            <td className={styles.cellMaterial}>
                {row ? (
                    <InputRichText
                        value={instructions}
                        onChangeHTML={setInstructions}
                        onBlurHTML={handleChange}
                        placeholder={placeholder}
                        minHeight={60}
                        importantPlaceholder={isIssueTeacher && !!row.subTeacher} // red if there isnt a sub teacher
                    />
                ) : null}
            </td>
        </tr>
    );
};

export default PortalWriteRow;
