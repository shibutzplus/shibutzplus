"use client";

import React, { useEffect, useState } from "react";
import styles from "./TeacherInstructionsCell.module.css";
import { TeacherScheduleType } from "@/models/types/portalSchedule";
import InputRichText from "@/components/ui/inputs/InputRichText/InputRichText";
import { getInstructionPlaceholder } from "@/utils/portal";
import { useTeacherTableContext } from "@/context/TeacherTableContext";
import { TeacherType } from "@/models/types/teachers";

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

    const isOriginalTeacher = teacher?.id === row?.originalTeacher?.id;

    useEffect(() => {
        if (!row) return;
        setInstructions(row.instructions || "");
    }, [row?.DBid, row?.instructions]);

    const handleChange = async (html: string) => {
        if (!row || !selectedDate) return;
        const value = html.trim();
        if (value === prevInstructions) return;
        setPrevInstructions(value);
        saveInstractions(value, row, selectedDate);
    };

    return (
        <div className={`${row ? styles.cellContent : styles.emptyCell}`}>
            {row ? (
                <InputRichText
                    value={instructions}
                    onChangeHTML={setInstructions}
                    onBlurHTML={handleChange}
                    placeholder={getInstructionPlaceholder(row, teacher)}
                    importantPlaceholder={isOriginalTeacher && !!row.subTeacher} // red if there isnt a sub teacher
                    minHeight={60}
                    maxLines={10}
                />
            ) : null}
        </div>
    );
};
export default TeacherInstructionsCell;
