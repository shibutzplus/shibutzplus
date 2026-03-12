import React, { useMemo } from "react";
import styles from "./MngrMissingReportCell.module.css";
import { MissingReportRecord } from "@/app/actions/GET/getMissingReportDataAction";
import { ColumnTypeValues } from "@/models/types/dailySchedule";
import { useOptionalMainContext } from "@/context/MainContext";
import { usePopup } from "@/context/PopupContext";
import ReasonPopup from "@/components/popups/ReasonPopup/ReasonPopup";
import { updateHistoryReasonAction } from "@/app/actions/PUT/updateHistoryReasonAction";
import { errorToast, successToast } from "@/lib/toast";
import { getDateReturnString } from "@/utils/time";
import { ClassType } from "@/models/types/classes";

type MngrMissingReportCellProps = {
    dayNumber: number;
    teacherId: string | null;
    records: MissingReportRecord[];
    onRefresh: () => void;
};

const MngrMissingReportCell: React.FC<MngrMissingReportCellProps> = ({
    dayNumber,
    teacherId,
    records,
    onRefresh,
}) => {
    const context = useOptionalMainContext();
    const contextClasses = context?.classes || [];
    const { openPopup, closePopup } = usePopup();

    const displayData = useMemo(() => {
        if (!records || records.length === 0) return null;

        // Take the first record to determine the column type (they should all be the same for this block)
        const primaryRecord = records[0];
        const isMissingTeacher = primaryRecord.columnType === ColumnTypeValues.missingTeacher;

        if (isMissingTeacher) {
            let activityTrueCount = 0;
            let activityFalseCount = 0;

            records.forEach(r => {
                let hasActivity = true; // Default to true if not found in db

                if (r.classes) {
                    const classNames = r.classes.split(',').map(s => s.trim());
                    // Check if at least one class has activity false
                    // According to requirements, what logic specifically dictates active/inactive? 
                    // Let's check them individually. But history stores them together... 
                    // Let's assume if ANY class has activity===false, the session has false activity? No, let's just check the matching class entities.
                    hasActivity = classNames.some(className => {
                        const matchingClass = contextClasses.find((c: ClassType) => c.name === className);
                        // If no matching class, fallback to true. If class found, return its activity boolean.
                        return matchingClass ? matchingClass.activity : true;
                    });
                }

                if (hasActivity) {
                    activityTrueCount++;
                } else {
                    activityFalseCount++;
                }
            });

            return {
                type: "missing" as const,
                reason: primaryRecord.reason || "ללא סיבה",
                activityTrueCount,
                activityFalseCount,
                replacementCount: 0
            };
        } else {
            // ExistingTeacher: count hours where subTeacher is not null
            let replacementCount = 0;
            records.forEach(r => {
                if (r.subTeacher) {
                    replacementCount++;
                }
            });

            return {
                type: "existing" as const,
                reason: primaryRecord.reason || "",
                activityTrueCount: 0,
                activityFalseCount: 0,
                replacementCount
            };
        }
    }, [records, contextClasses]);

    const handleClick = () => {
        if (!displayData || !records[0]?.date) return;

        const schoolId = context?.school?.id;
        if (!schoolId) return;

        const dateStr = getDateReturnString(records[0].date);
        const originalTeacher = records[0].originalTeacher;
        if (!originalTeacher) return;

        openPopup(
            "reasonPopup",
            "S",
            <ReasonPopup
                initialReason={displayData.reason === "ללא סיבה" ? "" : displayData.reason}
                onConfirm={async (newReason) => {
                    closePopup();
                    const response = await updateHistoryReasonAction(
                        schoolId,
                        dateStr,
                        originalTeacher,
                        newReason
                    );

                    if (response.success) {
                        onRefresh();
                    } else {
                        errorToast(response.message || "שגיאה בעדכון");
                    }
                }}
                onCancel={closePopup}
            />
        );
    };

    return (
        <td
            className={`${styles.scheduleCell} ${displayData ? styles.clickable : ""}`}
            onClick={handleClick}
        >
            <div className={styles.cellContent}>
                {displayData && displayData.type === "missing" && (
                    <>
                        <div className={`${styles.reasonText} ${styles.missingText}`}>{displayData.reason}</div>
                        {displayData.activityFalseCount > 0 && <div className={styles.countText}>{displayData.activityFalseCount} שעות הוראה</div>}
                        {displayData.activityTrueCount > 0 && <div className={styles.countText}>{displayData.activityTrueCount} שעות ק"ע</div>}
                    </>
                )}
                {displayData && displayData.type === "existing" && displayData.replacementCount > 0 && displayData.reason && (
                    <>
                        <div className={`${styles.reasonText} ${styles.existingText}`}>{displayData.reason}</div>
                        <div className={styles.countText}> {displayData.replacementCount} שעות הוראה</div>
                    </>
                )}
            </div>
        </td>
    );
};

export default MngrMissingReportCell;
