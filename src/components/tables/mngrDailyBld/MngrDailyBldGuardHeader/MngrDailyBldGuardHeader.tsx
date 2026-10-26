import React, { useState } from "react";
import { createPortal } from "react-dom";
import Loading from "@/components/loading/Loading/Loading";
import InputText from "../../../ui/inputs/InputText/InputText";
import { useDailyTableContext } from "@/context/DailyTableContext";
import { errorToast, successToast } from "@/lib/toast";
import messages from "@/resources/messages";
import useConfirmPopup from "@/hooks/useConfirmPopup";
import styles from "../MngrDailyBldTable/MngrDailyBldTable.module.css";
import MngrDailyBldColMenu from "../MngrDailyBldColMenu/MngrDailyBldColMenu";
import Icons from "@/style/icons";
import { usePopup } from "@/context/PopupContext";
import RecurringChoicePopup, { RecurringChoiceMode } from "@/components/popups/RecurringChoicePopup/RecurringChoicePopup";
import { useMainContext } from "@/context/MainContext";
import { logErrorAction } from "@/app/actions/POST/logErrorAction";
import { updateDailyEventHeaderAction } from "@/app/actions/PUT/updateDailyEventHeaderAction";
import { updateAllGuardHeader } from "@/services/daily/update";
import { DEFAULT_GUARD_TITLE } from "@/models/constant/daily";

type MngrDailyBldGuardHeaderProps = {
    columnId: string;
    onDelete?: (colId: string) => void;
    isFirst?: boolean;
    isLast?: boolean;
};

const MngrDailyBldGuardHeader: React.FC<MngrDailyBldGuardHeaderProps> = ({ columnId, onDelete, isFirst, isLast }) => {
    const { populateGuardColumn, mainDailyTable, setMainDailyTable, selectedDate, moveColumn, makeColumnRecurring, deleteRecurringFromDate, updateRecurringFromDate, detachRecurringColumn } = useDailyTableContext();
    const { school } = useMainContext();
    const [isMakingRecurring, setIsMakingRecurring] = useState(false);
    const { openPopup } = usePopup();

    const columnData = mainDailyTable[selectedDate]?.[columnId] || {};
    const selectedEventData = columnData["1"]?.headerCol?.headerEvent;

    // Detect if this column is part of a recurring series
    const isRecurring = columnId.startsWith("rec_");

    const initialValue = selectedEventData || DEFAULT_GUARD_TITLE;
    const [value, setValue] = useState(initialValue);
    const prevValueRef = React.useRef(initialValue);

    const hasTitle = Boolean(value && value.trim() !== "" && value !== DEFAULT_GUARD_TITLE);
    const hasCellContent = Object.values(columnData).some(cell =>
        Boolean((cell.event && cell.event.trim() !== "") || (cell.guardTeacherIds && cell.guardTeacherIds.length > 0))
    );
    const isColumnEmpty = !hasTitle && !hasCellContent;

    // Update local state when value from server changes (and we are not editing)
    React.useEffect(() => {
        const nextVal = selectedEventData || DEFAULT_GUARD_TITLE;
        setValue(nextVal);
        prevValueRef.current = nextVal;
    }, [selectedEventData]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setValue(e.target.value);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            e.preventDefault();
            e.currentTarget.blur();
        }
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        let newValue = e.target.value.trim();

        // If empty, reset default to DEFAULT_GUARD_TITLE
        if (newValue === "") {
            newValue = DEFAULT_GUARD_TITLE;
            setValue(newValue);
        }

        if (prevValueRef.current === newValue) return;

        if (isRecurring) {
            // For recurring columns, ask the user about the scope of the title change
            openPopup(
                "recurringChoice",
                "S",
                <RecurringChoicePopup
                    text="לשנות את כותרת התורנות?"
                    singleLabel="רק עבור יום זה"
                    futureLabel="מעכשיו ועד סוף השנה"
                    onChoice={async (mode: RecurringChoiceMode) => {
                        if (mode === "single") {
                            // Detach this day from the series and update normally
                            await detachAndUpdate(newValue);
                        } else {
                            // Update title for all future weeks in the series
                            await updateRecurringFromDate?.(columnId, selectedDate, { eventTitle: newValue });
                        }
                        prevValueRef.current = newValue;
                    }}
                    onCancel={() => {
                        setValue(prevValueRef.current);
                    }}
                />,
            );
        } else {
            populateGuardColumn(columnId, newValue);
            prevValueRef.current = newValue;
        }
    };

    const detachAndUpdate = async (newTitle: string) => {
        if (!isRecurring) return;
        const newColId = await detachRecurringColumn?.(columnId, selectedDate);
        if (newColId) {
            await updateDailyEventHeaderAction(selectedDate, newColId, newTitle);
            setMainDailyTable(prev => updateAllGuardHeader(prev, selectedDate, newColId, newTitle));
            prevValueRef.current = newTitle;
        }
    };

    const { handleOpenPopup } = useConfirmPopup();

    const handleDeleteClick = () => {
        const deleteLabel = selectedEventData || "התורנות";

        if (isRecurring) {
            // For recurring columns show the choice popup
            openPopup(
                "recurringChoice",
                "S",
                <RecurringChoicePopup
                    text={`האם למחוק את ${deleteLabel}?`}
                    singleLabel="רק עבור יום זה"
                    futureLabel="מעכשיו ועד סוף השנה"
                    onChoice={async (mode: RecurringChoiceMode) => {
                        if (mode === "single") {
                            // Standard single-day delete
                            onDelete?.(columnId);
                        } else {
                            // Bulk delete from this date onwards
                            await deleteRecurringFromDate?.(columnId, selectedDate);
                        }
                    }}
                />,
            );
        } else {
            const msg = `האם למחוק את ${deleteLabel}?`;

            if (isColumnEmpty) {
                onDelete?.(columnId);
            } else {
                handleOpenPopup("deleteDailyCol", msg, async () => onDelete?.(columnId));
            }
        }
    };

    const handleMakeRecurring = async () => {
        if (isColumnEmpty) return;
        setIsMakingRecurring(true);
        try {
            await makeColumnRecurring?.(columnId);
            successToast(messages.dailySchedule.guardRecurringSuccess, 3000);
        } catch (error) {
            logErrorAction({
                description: `Exception in handleMakeRecurring: ${error instanceof Error ? error.message : String(error)}`,
                schoolId: school?.id,
                metadata: { columnId, selectedDate }
            });
            errorToast(messages.dailySchedule.guardRecurringError);
        } finally {
            setIsMakingRecurring(false);
        }
    };

    return (
        <>
            {isMakingRecurring && typeof document !== "undefined" && createPortal(
                <div
                    style={{
                        position: "fixed",
                        inset: 0,
                        zIndex: 99999,
                        cursor: "wait",
                    }}
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                    }}
                    onMouseDown={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                    }}
                />,
                document.body,
            )}
            <div className={styles.headerContentWrapper}>
                {isMakingRecurring ? (
                    <div style={{ padding: "0 10px", flexShrink: 0 }}>
                        <Loading size="S" color="white" />
                    </div>
                ) : (
                    <MngrDailyBldColMenu
                        onDelete={handleDeleteClick}
                        onMoveRight={() => moveColumn && moveColumn(columnId, "right")}
                        onMoveLeft={() => moveColumn && moveColumn(columnId, "left")}
                        isFirst={isFirst}
                        isLast={isLast}
                        bottomChildren={
                            !isRecurring
                                ? ({ closeMenu }) => (
                                    <div
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            if (isColumnEmpty) return;
                                            closeMenu();
                                            handleMakeRecurring();
                                        }}
                                        className={`${styles.menuItem} ${isColumnEmpty ? styles.menuItemDisabled : ""}`}
                                    >
                                        <Icons.repeat size={14} />
                                        <span>תורנות שבועית חוזרת</span>
                                    </div>
                                )
                                : undefined
                        }
                    />
                )}
                <div className={styles.inputSelectWrapper}>
                    <div style={{ width: "100%" }}>
                        <div style={{ display: "flex", alignItems: "center", width: "100%" }}>
                            {isRecurring && (
                                <Icons.repeat
                                    size={13}
                                    title="תורנות שבועית חוזרת"
                                    style={{ flexShrink: 0, opacity: 0.85, color: "white" }}
                                />
                            )}
                            <InputText
                                placeholder="תורנות"
                                value={value}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                onKeyDown={handleKeyDown}
                                backgroundColor="transparent"
                                hasBorder={false}
                                fontSize="18px"
                                maxLength={25}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default MngrDailyBldGuardHeader;
