import React, { useState, useMemo } from "react";
import { createPortal } from "react-dom";
import styles from "./MngrAnnualViewCell.module.css";
import { WeeklySchedule } from "@/models/types/annualSchedule";
import { SubjectType } from "@/models/types/subjects";
import { TeacherType } from "@/models/types/teachers";
import { ClassType } from "@/models/types/classes";
import { getAnnualCellDisplayData } from "@/utils/annualCellDisplay";
import Icons from "@/style/icons";
import AnnualCellEditPopover, { PopoverAssignmentRow } from "./AnnualCellEditPopover";
import { useMainContext } from "@/context/MainContext";
import { useOptionalAnnualView } from "@/context/AnnualViewContext";
import { updateAnnualCellScheduleAction } from "@/app/actions/PUT/updateAnnualCellScheduleAction";
import { dayToNumber } from "@/utils/time";
import { errorToast } from "@/lib/toast";
import messages from "@/resources/messages";

type MngrAnnualViewCellProps = {
    day: string;
    hour: number;
    schedule: WeeklySchedule;
    selectedClassId: string;
    selectedTeacherId: string;
    subjects: SubjectType[];
    teachers: TeacherType[];
    classes: ClassType[];
};

const MngrAnnualViewCell: React.FC<MngrAnnualViewCellProps> = ({
    day,
    hour,
    schedule,
    selectedClassId,
    selectedTeacherId,
    subjects,
    teachers,
    classes,
}) => {
    const { school, applyBatchAnnualScheduleUpdates, annualScheduleTable: mainScheduleTable } = useMainContext();
    const annualView = useOptionalAnnualView();
    const activeScheduleTable = annualView?.annualScheduleTable ?? mainScheduleTable;
    const applyBatchSchedule = annualView?.applyBatchScheduleUpdates ?? applyBatchAnnualScheduleUpdates;
    const isAlt = annualView?.isAlt ?? false;

    const [popoverOpen, setPopoverOpen] = useState(false);
    const [choiceMenuOpen, setChoiceMenuOpen] = useState(false);
    const [activeEditMode, setActiveEditMode] = useState<"class" | "teacher" | null>(null);
    const [anchorRect, setAnchorRect] = useState<DOMRect | null>(null);

    const handleOpenEdit = (e: React.MouseEvent<HTMLElement>) => {
        e.stopPropagation();
        if (typeof window !== "undefined" && window.getSelection) {
            window.getSelection()?.removeAllRanges();
        }
        const cellEl = (e.currentTarget.closest("td") || e.currentTarget) as HTMLElement;
        const rect = cellEl ? cellEl.getBoundingClientRect() : e.currentTarget.getBoundingClientRect();
        setAnchorRect(rect);

        if (selectedClassId && selectedTeacherId) {
            setChoiceMenuOpen(true);
            setPopoverOpen(false);
        } else {
            setActiveEditMode(selectedClassId ? "class" : selectedTeacherId ? "teacher" : null);
            setChoiceMenuOpen(false);
            setPopoverOpen(true);
        }
    };

    const handleSelectChoice = (mode: "class" | "teacher") => {
        if (mode === "class") {
            // Clear teacher filter at the top bar so the view cleanly shows the class schedule
            annualView?.setSelectedTeacherId?.("");
            setActiveEditMode("class");
        } else {
            // Clear class filter at the top bar so the view cleanly shows the teacher schedule
            annualView?.setSelectedClassId?.("");
            setActiveEditMode("teacher");
        }
        setChoiceMenuOpen(false);
        setPopoverOpen(true);
    };

    const handleCloseEdit = () => {
        setPopoverOpen(false);
        setChoiceMenuOpen(false);
        setAnchorRect(null);
        setActiveEditMode(null);
    };

    const classNameText = classes?.find((c) => c.id === selectedClassId)?.name;
    const teacherNameText = teachers?.find((t) => t.id === selectedTeacherId)?.name;

    const editBtn = (
        <button
            type="button"
            className={styles.cellEditBtn}
            onClick={handleOpenEdit}
            title="עריכת שיבוץ"
            aria-label="עריכת שיבוץ"
        >
            <Icons.edit size={16} />
        </button>
    );

    // Determine which ID to use for looking up the schedule
    // If Class is selected, we use Class ID.
    // If only Teacher is selected, we use Teacher ID.
    const lookupId = selectedClassId || selectedTeacherId;
    const cellData = lookupId && schedule[lookupId]?.[day]?.[hour];

    // For editing: if both are selected, user chooses which entity to edit
    const effectiveEditMode = activeEditMode || (selectedClassId ? "class" : selectedTeacherId ? "teacher" : null);
    const effectiveClassId = effectiveEditMode === "teacher" ? "" : selectedClassId;
    const effectiveTeacherId = effectiveEditMode === "class" ? "" : selectedTeacherId;
    const activeLookupId = effectiveClassId || effectiveTeacherId;

    const dayNum = Number(day) || dayToNumber(day);

    const popoverCellData = useMemo(() => {
        if (schedule && activeLookupId && schedule[activeLookupId]?.[day]?.[hour]) {
            return schedule[activeLookupId][day][hour];
        }
        if (!activeScheduleTable || !activeLookupId) return undefined;
        const rows = activeScheduleTable.filter((r) => {
            if (r.day !== dayNum || r.hour !== hour) return false;
            if (effectiveClassId) return r.classId === effectiveClassId;
            if (effectiveTeacherId) return r.teacherId === effectiveTeacherId;
            return false;
        });
        if (rows.length === 0) return undefined;

        return {
            teachers: rows.map((r) => r.teacherId || "").filter(Boolean),
            classes: rows.map((r) => r.classId || "").filter(Boolean),
            subjects: rows.map((r) => r.subjectId || "").filter(Boolean),
            teacherSubjects: rows.map((r) => ({
                teacherId: r.teacherId || "",
                subjectId: r.subjectId || "",
            })),
            classSubjects: rows.map((r) => ({
                classId: r.classId || "",
                subjectId: r.subjectId || "",
            })),
        };
    }, [schedule, activeLookupId, day, hour, activeScheduleTable, effectiveClassId, effectiveTeacherId, dayNum]);

    const handleSave = async (assignments: PopoverAssignmentRow[]) => {
        if (!school?.id) return;

        const dayNum = Number(day) || dayToNumber(day);

        // 1. Snapshot previous rows for this cell to enable rollback on failure
        const previousRows = (activeScheduleTable || []).filter((r) => {
            if (r.day !== dayNum || r.hour !== hour) return false;
            if (effectiveClassId) return r.classId === effectiveClassId;
            if (effectiveTeacherId) return r.teacherId === effectiveTeacherId;
            return false;
        });
        const previousRowIds = previousRows.map((r) => r.id);

        // Check if assignments actually changed (dirty check)
        // If the set of (teacherId, classId, subjectId) is identical, skip DB call completely!
        const prevKeys = previousRows
            .map((r) => `${r.teacherId || ""}|${r.classId || ""}|${r.subjectId || ""}`)
            .sort();
        const newKeys = assignments
            .map((a) => `${a.teacherId || ""}|${a.classId || ""}|${a.subjectId || ""}`)
            .sort();

        const isUnchanged =
            prevKeys.length === newKeys.length &&
            prevKeys.every((key, idx) => key === newKeys[idx]);

        if (isUnchanged) {
            return;
        }

        // 2. Prepare optimistic items with temporary IDs
        const optimisticAddedItems = assignments.map((a, idx) => ({
            id: `optimistic-${Date.now()}-${idx}`,
            day: dayNum,
            hour,
            schoolId: school.id,
            teacherId: a.teacherId,
            classId: a.classId,
            subjectId: a.subjectId,
            createdAt: new Date(),
            updatedAt: new Date(),
        }));
        const optimisticAddedIds = optimisticAddedItems.map((item) => item.id);

        // 3. Immediately apply optimistic update (0ms delay for user!)
        applyBatchSchedule(previousRowIds, optimisticAddedItems);

        // 4. Send save request to the server in the background
        const res = await updateAnnualCellScheduleAction({
            day: dayNum,
            hour,
            schoolId: school.id,
            selectedClassId: effectiveClassId || undefined,
            selectedTeacherId: effectiveTeacherId || undefined,
            assignments: assignments.map((a) => ({
                teacherId: a.teacherId,
                classId: a.classId,
                subjectId: a.subjectId,
            })),
            isAlt,
        });

        if (res.success) {
            // Replace optimistic items with real DB items returned by the server
            const serverDeletedIds = (res.deleted || []).map((d) => d.id);
            const toDeleteIds = Array.from(new Set([...optimisticAddedIds, ...serverDeletedIds]));
            applyBatchSchedule(toDeleteIds, res.added || []);
        } else {
            // Rollback: revert optimistic items and restore previous rows
            applyBatchSchedule(optimisticAddedIds, previousRows);
            errorToast(res.message || messages.annualSchedule.updateError);
        }
    };

    const renderChoiceMenu = () => {
        if (!choiceMenuOpen || !anchorRect || typeof document === "undefined") return null;

        const top =
            window.innerHeight - anchorRect.bottom < 110 && anchorRect.top > 110
                ? anchorRect.top - 80
                : Math.min(anchorRect.bottom + 4, window.innerHeight - 110);
        const left = Math.max(10, Math.min(anchorRect.right - 180, window.innerWidth - 190));

        return createPortal(
            <div className={styles.choiceBackdrop} onClick={handleCloseEdit}>
                <div
                    className={styles.choiceMenu}
                    style={{
                        position: "fixed",
                        top,
                        left,
                        zIndex: 9999,
                    }}
                    onClick={(e) => e.stopPropagation()}
                >
                    <button
                        type="button"
                        className={styles.choiceItem}
                        onClick={() => handleSelectChoice("class")}
                    >
                        <Icons.edit size={14} />
                        <span>ערוך כיתה {classNameText ? `(${classNameText})` : ""}</span>
                    </button>
                    <button
                        type="button"
                        className={styles.choiceItem}
                        onClick={() => handleSelectChoice("teacher")}
                    >
                        <Icons.edit size={14} />
                        <span>ערוך מורה {teacherNameText ? `(${teacherNameText})` : ""}</span>
                    </button>
                </div>
            </div>,
            document.body
        );
    };

    const renderPopover = () => {
        if (!popoverOpen) return null;
        return (
            <AnnualCellEditPopover
                onClose={handleCloseEdit}
                anchorRect={anchorRect}
                day={day}
                hour={hour}
                selectedClassId={effectiveClassId}
                selectedTeacherId={effectiveTeacherId}
                teachers={teachers}
                classes={classes}
                subjects={subjects}
                cellData={popoverCellData || undefined}
                onSave={handleSave}
            />
        );
    };

    if (!cellData) {
        return (
            <td className={styles.scheduleCell} onDoubleClick={handleOpenEdit}>
                <div className={`${styles.cellContent} ${styles.viewOnly}`}>
                    {editBtn}
                </div>
                {renderChoiceMenu()}
                {renderPopover()}
            </td>
        );
    }

    // shared component logic
    const { assignmentGroups, shouldRender } = getAnnualCellDisplayData(
        cellData,
        selectedClassId,
        selectedTeacherId,
        subjects,
        teachers,
        classes
    );

    if (!shouldRender || assignmentGroups.length === 0) {
        // Fallback similar to empty cell logic if not rendering
        return (
            <td className={styles.scheduleCell} onDoubleClick={handleOpenEdit}>
                <div className={`${styles.cellContent} ${styles.viewOnly}`}>
                    {editBtn}
                </div>
                {renderChoiceMenu()}
                {renderPopover()}
            </td>
        );
    }

    const isSingle = assignmentGroups.length === 1;

    let content: React.ReactNode = null;

    if (isSingle) {
        const group = assignmentGroups[0];
        const primaryClass = selectedTeacherId ? styles.class : styles.teacher;
        content = (
            <div className={styles.singleGroup}>
                {group.primaryText && (
                    <div className={primaryClass}>
                        {group.primaryText}
                    </div>
                )}
                {group.subjectText && (
                    <div className={group.primaryText ? styles.subjectChip : styles.subject}>
                        {group.subjectText}
                    </div>
                )}
            </div>
        );
    } else {
        const primaryClass = selectedTeacherId ? styles.classInline : styles.teacherInline;
        content = (
            <div className={styles.multiGroups}>
                {assignmentGroups.map((group, idx) => (
                    <div key={idx} className={styles.assignmentRow}>
                        {group.primaryText && (
                            <span className={primaryClass}>
                                {group.primaryText}
                            </span>
                        )}
                        {group.subjectText && (
                            <span
                                className={
                                    group.primaryText
                                        ? `${styles.subjectChip} ${styles.chipSmall}`
                                        : styles.subject
                                }
                            >
                                {group.subjectText}
                            </span>
                        )}
                    </div>
                ))}
            </div>
        );
    }

    return (
        <td className={styles.scheduleCell} onDoubleClick={handleOpenEdit}>
            <div className={`${styles.cellContent} ${styles.viewOnly}`}>
                {editBtn}
                {content}
            </div>
            {renderChoiceMenu()}
            {renderPopover()}
        </td>
    );
};

export default MngrAnnualViewCell;
