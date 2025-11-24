"use client";

import { updateDailyInstructionAction } from "@/app/actions/PUT/updateDailyInstractionAction";
import { errorToast } from "@/lib/toast";
import messages from "@/resources/messages";
import { useState } from "react";

export const usePortalActions = () => {
    const [isSaving, setIsSaving] = useState<boolean>(false);

    const handleSave = async (
        rowId: string,
        hour: number,
        instructions?: string,
        schoolId?: string,
        issueTeacherId?: string,
        subTeacherId?: string,
    ) => {
        try {
            setIsSaving(true);
            if (!selectedDate) return;

            const response = await (schoolId && issueTeacherId && subTeacherId
                ? (updateDailyInstructionAction as any)(
                      selectedDate,
                      rowId,
                      instructions,
                      hour,
                      schoolId,
                      issueTeacherId,
                      subTeacherId,
                  )
                : updateDailyInstructionAction(selectedDate, rowId, instructions));

            if (response.success) {
                const portalSchedule = { ...mainPortalTable };
                portalSchedule[selectedDate][`${hour}`].instructions = instructions;
                setMainPortalTable(portalSchedule);
            } else {
                errorToast(messages.dailySchedule.error);
            }
        } catch (error) {
            console.error("Error updating daily schedule entry:", error);
            errorToast(messages.dailySchedule.error);
        } finally {
            setIsSaving(false);
        }
    };

    return {
        isSaving,
        handleSave,
    };
};
