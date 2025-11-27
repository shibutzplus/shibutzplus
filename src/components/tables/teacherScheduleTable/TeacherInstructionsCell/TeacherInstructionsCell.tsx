"use client";

import React, { useEffect, useState } from "react";
import styles from "./TeacherInstructionsCell.module.css";
import { TeacherScheduleType } from "@/models/types/portalSchedule";
import InputRichText from "@/components/ui/inputs/InputRichText/InputRichText";
import { usePortalContext } from "@/context/PortalContext";
import { getInstructionPlaceholder } from "@/utils/portal";

type TeacherInstructionsCellProps = {
    row: TeacherScheduleType | undefined;
};

const TeacherInstructionsCell: React.FC<TeacherInstructionsCellProps> = ({ row }) => {
    const { selectedDate, teacher, saveInstractions, isSavingLoading } = usePortalContext();
    const [instructions, setInstructions] = useState<string>(row?.instructions || "");
    const [prevInstructions, setPrevInstructions] = useState<string>(row?.instructions || "");

    const isIssueTeacher = teacher?.id === row?.issueTeacher?.id;

    useEffect(() => {
        if (!row) return;
        setInstructions(row.instructions || "");
    }, [row]);

    const handleChange = async (html: string) => {
        if (!row || !selectedDate) return;
        const value = html.trim();
        if (value === prevInstructions) return;
        setPrevInstructions(value);
        saveInstractions(value, row);
    };

    return (
        <div className={`${row ? styles.cellContent : styles.emptyCell}`}>
            {row ? (
                <InputRichText
                    value={instructions}
                    onChangeHTML={setInstructions}
                    onBlurHTML={handleChange}
                    placeholder={getInstructionPlaceholder(row, teacher)}
                    importantPlaceholder={isIssueTeacher && !!row.subTeacher} // red if there isnt a sub teacher
                    minHeight={60}
                    maxLines={10}
                />
            ) : null}
        </div>
    );
};
export default TeacherInstructionsCell;
