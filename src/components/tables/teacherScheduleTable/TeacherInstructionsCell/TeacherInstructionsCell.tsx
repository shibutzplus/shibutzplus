"use client";

import React, { useEffect, useState } from "react";
import styles from "./TeacherInstructionsCell.module.css";
import { TeacherScheduleType } from "@/models/types/portalSchedule";
import InputRichText from "@/components/ui/inputs/InputRichText/InputRichText";
import { usePortalContext } from "@/context/PortalContext";
import { updateDailyInstructionAction } from "@/app/actions/PUT/updateDailyInstractionAction";
import { errorToast } from "@/lib/toast";
import messages from "@/resources/messages";
import { getInstructionPlaceholder } from "@/utils/portal";

type TeacherInstructionsCellProps = {
    row: TeacherScheduleType | undefined;
};

const TeacherInstructionsCell: React.FC<TeacherInstructionsCellProps> = ({ row }) => {
    const { selectedDate, teacher } = usePortalContext();
    const [instructions, setInstructions] = useState<string>(row?.instructions || "");
    const [prevInstructions, setPrevInstructions] = useState<string>(row?.instructions || "");
    const [isSaving, setIsSaving] = useState<boolean>(false);

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
        setIsSaving(true);
        const schoolId = row.schoolId ?? row.school?.id;
        const issueTeacherId = row.issueTeacher?.id ?? undefined;
        const subTeacherId = row.subTeacher?.id ?? undefined;

        // const response = await (schoolId && issueTeacherId && subTeacherId
        //     ? (updateDailyInstructionAction as any)(
        //           selectedDate,
        //           rowId,
        //           instructions,
        //           hour,
        //           schoolId,
        //           issueTeacherId,
        //           subTeacherId,
        //       )
        //     : updateDailyInstructionAction(selectedDate, rowId, instructions));

        // if (response.success) {
        //     // const portalSchedule = { ...mainPortalTable };
        //     // portalSchedule[selectedDate][`${hour}`].instructions = instructions;
        //     // setMainPortalTable(portalSchedule);
        // } else {
        //     errorToast(messages.dailySchedule.error);
        // }
    };

    return (
        <td className={styles.scheduleCell}>
            <div className={`${row ? styles.cellContent : styles.emptyCell}`}>
                {row ? (
                    <InputRichText
                        value={instructions}
                        onChangeHTML={setInstructions}
                        onBlurHTML={handleChange}
                        placeholder={getInstructionPlaceholder(row, teacher)}
                        importantPlaceholder={isIssueTeacher && !!row.subTeacher} // red if there isnt a sub teacher
                        minHeight={60}
                    />
                ) : null}
            </div>
        </td>
    );
};
export default TeacherInstructionsCell;
