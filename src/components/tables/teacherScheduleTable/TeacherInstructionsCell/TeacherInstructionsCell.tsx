"use client";

import React, { useEffect, useState } from "react";
import styles from "./TeacherInstructionsCell.module.css";
import { TeacherScheduleType } from "@/models/types/portalSchedule";
import InputRichText from "@/components/ui/inputs/InputRichText/InputRichText";
import { getInstructionPlaceholder } from "@/utils/portal";
import { useTeacherTableContext } from "@/context/TeacherTableContext";
import { TeacherType } from "@/models/types/teachers";
import { dailyInstructionSchema } from "@/models/validation/daily";
import { errorToast } from "@/lib/toast";

type TeacherInstructionsCellProps = {
    row: TeacherScheduleType | undefined;
    teacher?: TeacherType;
    selectedDate: string;
};

const TeacherInstructionsCell: React.FC<TeacherInstructionsCellProps> = ({
    row,
    teacher,
    selectedDate,
}) => {
    const { saveInstractions } = useTeacherTableContext();
    const [instructions, setInstructions] = useState<string>(row?.instructions || "");
    const [prevInstructions, setPrevInstructions] = useState<string>(row?.instructions || "");

    const isIssueTeacher = teacher?.id === row?.issueTeacher?.id;

    useEffect(() => {
        if (!row) return;
        setInstructions(row.instructions || "");
    }, [row?.DBid, row?.instructions]);

    const handleChange = async (html: string) => {
        if (!row || !selectedDate) return;
        const value = html.trim();
        if (value === prevInstructions) return;

        const validation = dailyInstructionSchema.safeParse({ instructions: value });
        if (!validation.success) {
            errorToast(validation.error.issues[0]?.message || "תוכן ההנחיות לא תקין");
            return;
        }

        const cleanInstructions = validation.data.instructions;

        // If normalization changed content (e.g. sanitization), update state to match
        if (
            cleanInstructions !== value &&
            cleanInstructions !== undefined &&
            cleanInstructions !== null
        ) {
            setInstructions(cleanInstructions);
        }

        setPrevInstructions(cleanInstructions || "");
        saveInstractions(cleanInstructions || "", row, selectedDate);
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
