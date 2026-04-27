import React, { useMemo } from "react";
import styles from "./MngrMissingReportCell.module.css";
import { MissingReportRecord } from "@/app/actions/GET/getMissingReportDataAction";
import { ColumnTypeValues } from "@/models/types/dailySchedule";
import { useOptionalMainContext } from "@/context/MainContext";
import { usePopup } from "@/context/PopupContext";
import ReasonPopup from "@/components/popups/ReasonPopup/ReasonPopup";
import { updateHistoryReasonAction } from "@/app/actions/PUT/updateHistoryReasonAction";
import { errorToast } from "@/lib/toast";
import { getDateReturnString } from "@/utils/time";

type MngrMissingReportCellProps = {
    dayNumber: number;
    teacherId: string | null;
    records: MissingReportRecord[];
    onRefresh: () => void;
};

const MngrMissingReportCell: React.FC<MngrMissingReportCellProps> = ({
    dayNumber: _dayNumber,
    teacherId: _teacherId,
    records,
    onRefresh,
}) => {
    const context = useOptionalMainContext();
    const { openPopup, closePopup } = usePopup();

    const displayData = useMemo(() => {
        if (!records || records.length === 0) return null;

        // Take the first record to determine the column type (they should all be the same for this block)
        const primaryRecord = records[0];
        const isMissingTeacher = primaryRecord.columnType === ColumnTypeValues.missingTeacher;

        // Build substitute list: group by subTeacher name, count hours, look up role
        const teachers = context?.teachers || [];
        const hoursByName: Record<string, number> = {};
        records.forEach(r => {
            if (r.subTeacher) {
                const found = teachers.find(t => t.name === r.subTeacher);
                if (found) {
                    hoursByName[r.subTeacher] = (hoursByName[r.subTeacher] || 0) + 1;
                }
            }
        });
        const substituteList = Object.entries(hoursByName)
            .sort((a, b) => b[1] - a[1])
            .map(([name, count]) => {
                const teacher = teachers.find(t => t.name === name);
                return { name, count, role: teacher?.role ?? "regular" };
            });

        if (isMissingTeacher) {
            return {
                type: "missing" as const,
                reason: primaryRecord.reason || "ללא סיבה",
                substituteList
            };
        } else {
            const replacementCount = substituteList.reduce((sum, s) => sum + s.count, 0);
            return {
                type: "existing" as const,
                reason: primaryRecord.reason || "",
                substituteList,
                replacementCount
            };
        }
    }, [records, context?.teachers]);

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

    const renderSubstituteList = (list: { name: string; count: number; role: string }[]) => {
        if (!list || list.length === 0) return null;
        return (
            <div className={styles.substituteList}>
                {list.map(s => (
                    <div
                        key={s.name}
                        className={`${styles.substituteItem} ${
                            s.role === "substitute" ? styles.substituteRoleSubstitute : styles.substituteRoleRegular
                        }`}
                    >
                        {s.name} ({s.count})
                    </div>
                ))}
            </div>
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
                        {renderSubstituteList(displayData.substituteList)}
                    </>
                )}
                {displayData && displayData.type === "existing" && displayData.replacementCount > 0 && displayData.reason && (
                    <>
                        <div className={`${styles.reasonText} ${styles.existingText}`}>{displayData.reason}</div>
                        {renderSubstituteList(displayData.substituteList)}
                    </>
                )}
            </div>
        </td>
    );
};

export default MngrMissingReportCell;
