import React, { useState } from "react";
import { createPortal } from "react-dom";
import Loading from "@/components/loading/Loading/Loading";
import InputText from "../../../ui/inputs/InputText/InputText";
import { useDailyTableContext } from "@/context/DailyTableContext";
import { errorToast, successToast } from "@/lib/toast";
import useConfirmPopup from "@/hooks/useConfirmPopup";
import styles from "../MngrDailyBldTable/MngrDailyBldTable.module.css";
import { formatTMDintoDMY } from "@/utils/time";
import MngrDailyBldColMenu from "../MngrDailyBldColMenu/MngrDailyBldColMenu";
import { useColumnClipboard } from "@/context/ColumnClipboardContext";
import { ColumnTypeValues } from "@/models/types/dailySchedule";
import Icons from "@/style/icons";
import { usePopup } from "@/context/PopupContext";
import RecurringChoicePopup, { RecurringChoiceMode } from "@/components/popups/RecurringChoicePopup/RecurringChoicePopup";
import { useMainContext } from "@/context/MainContext";
import { logErrorAction } from "@/app/actions/POST/logErrorAction";
import { updateDailyEventHeaderAction } from "@/app/actions/PUT/updateDailyEventHeaderAction";
import { updateAllEventHeader } from "@/services/daily/update";

type MngrDailyBldEventHeaderProps = {
    columnId: string;
    onDelete?: (colId: string) => void;
    isFirst?: boolean;
    isLast?: boolean;
};

const MngrDailyBldEventHeader: React.FC<MngrDailyBldEventHeaderProps> = ({ columnId, onDelete, isFirst, isLast }) => {
    const { populateEventColumn, mainDailyTable, setMainDailyTable, selectedDate, moveColumn, pasteEventColumn, makeColumnRecurring, deleteRecurringFromDate, updateRecurringFromDate, detachRecurringColumn } = useDailyTableContext();
    const { hasClipboardData, pasteColumn, copyColumn } = useColumnClipboard();
    const { school } = useMainContext();
    const [isPasting, setIsPasting] = useState(false);
    const [isMakingRecurring, setIsMakingRecurring] = useState(false);
    const { openPopup } = usePopup();

    const columnData = mainDailyTable[selectedDate]?.[columnId] || {};
    const selectedEventData = columnData["1"]?.headerCol?.headerEvent;

    // Detect if this column is part of a recurring series
    const isRecurring = columnId.startsWith("rec_");

    const handleCopy = () => {
        copyColumn(ColumnTypeValues.event, columnData);
        successToast("תוכן העמודה הועתק", 1000);
    };

    const [value, setValue] = useState(selectedEventData || "");
    const prevValueRef = React.useRef(selectedEventData || "");
    const hasTitle = Boolean(value && value.trim() !== "");
    const hasCellContent = Object.values(columnData).some(cell => Boolean(cell.event && cell.event.trim() !== ""));
    const isColumnEmpty = !hasTitle && !hasCellContent;

    // Update local state when value from server changes (and we are not editing)
    React.useEffect(() => {
        setValue(selectedEventData || "");
        prevValueRef.current = selectedEventData || "";
    }, [selectedEventData]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setValue(e.target.value);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        let newValue = e.target.value.trim();

        // If empty, set default to current date
        if (newValue === "") {
            newValue = formatTMDintoDMY(selectedDate);
            setValue(newValue);
        }

        if (prevValueRef.current === newValue) return;

        if (isRecurring) {
            // For recurring columns, ask the user about the scope of the title change
            openPopup(
                "recurringChoice",
                "S",
                <RecurringChoicePopup
                    text="לשנות את כותרת האירוע?"
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
            populateEventColumn(columnId, newValue);
            prevValueRef.current = newValue;
        }
    };

    const detachAndUpdate = async (newTitle: string) => {
        if (!isRecurring) return;
        const newColId = await detachRecurringColumn?.(columnId, selectedDate);
        if (newColId) {
            await updateDailyEventHeaderAction(selectedDate, newColId, newTitle);
            setMainDailyTable(prev => updateAllEventHeader(prev, selectedDate, newColId, newTitle));
            prevValueRef.current = newTitle;
        }
    };

    const { handleOpenPopup } = useConfirmPopup();

    const handleDeleteClick = () => {
        const deleteLabel = selectedEventData || "האירוע";

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
            successToast("האירוע שובץ באופן קבוע עד סוף השנה (לא כולל חופשות)", 5000);
        } catch (error) {
            logErrorAction({
                description: `Exception in handleMakeRecurring: ${error instanceof Error ? error.message : String(error)}`,
                schoolId: school?.id,
                metadata: { columnId, selectedDate }
            });
            errorToast("שגיאה בהגדרת האירוע כחוזר");
        } finally {
            setIsMakingRecurring(false);
        }
    };

    const handlePaste = async () => {
        const clipboard = pasteColumn();
        if (!clipboard || clipboard.type !== ColumnTypeValues.event) return;

        setIsPasting(true);
        try {
            const success = await pasteEventColumn(columnId, clipboard.columnData);
            if (!success) {
                logErrorAction({
                    description: "Failed to paste event column: pasteEventColumn returned falsy",
                    schoolId: school?.id,
                    metadata: { columnId, selectedDate }
                });
                errorToast("שגיאה בהדבקת העמודה");
            }
        } catch (error) {
            logErrorAction({
                description: `Exception in handlePaste: ${error instanceof Error ? error.message : String(error)}`,
                schoolId: school?.id,
                metadata: { columnId, selectedDate }
            });
            errorToast("שגיאה בהדבקת העמודה");
        } finally {
            setIsPasting(false);
        }
    };

    const showPaste = hasClipboardData(ColumnTypeValues.event);

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
                {isPasting || isMakingRecurring ? (
                    <div style={{ padding: "0 10px", flexShrink: 0 }}>
                        <Loading size="S" color="white" />
                    </div>
                ) : (
                    <MngrDailyBldColMenu
                        onDelete={handleDeleteClick}
                        onMoveRight={() => moveColumn && moveColumn(columnId, "right")}
                        onMoveLeft={() => moveColumn && moveColumn(columnId, "left")}
                        onPaste={handlePaste}
                        onCopy={handleCopy}
                        showPaste={showPaste}
                        disableCopy={isColumnEmpty}
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
                                        <span>אירוע שבועי חוזר</span>
                                    </div>
                                )
                                : undefined
                        }
                    />
                )}
                <div className={styles.inputSelectWrapper}>
                    <div style={{ width: "100%" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "4px", width: "100%" }}>
                            {isRecurring && (
                                <Icons.repeat
                                    size={13}
                                    title="אירוע שבועי חוזר"
                                    style={{ flexShrink: 0, opacity: 0.85, color: "white" }}
                                />
                            )}
                            <InputText
                                placeholder="כותרת האירוע"
                                value={value}
                                onChange={handleChange}
                                onBlur={handleBlur}
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

export default MngrDailyBldEventHeader;
