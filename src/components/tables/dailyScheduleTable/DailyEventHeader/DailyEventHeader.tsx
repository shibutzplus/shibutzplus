import React, { useState } from "react";
import InputText from "../../../ui/inputs/InputText/InputText";
import { useDailyTableContext } from "@/context/DailyTableContext";
import { errorToast } from "@/lib/toast";
import messages from "@/resources/messages";
import useDeletePopup from "@/hooks/useDeletePopup";
import Icons from "@/style/icons";
import styles from "../DailyTable/DailyTable.module.css";
import { formatTMDintoDMY } from "@/utils/time";
import { useClickOutside } from "@/hooks/useClickOutside";

type DailyEventHeaderProps = {
    columnId: string;
    onDelete?: (colId: string) => void;
    isFirst?: boolean;
    isLast?: boolean;
};

const DailyEventHeader: React.FC<DailyEventHeaderProps> = ({ columnId, onDelete, isFirst, isLast }) => {
    const { populateEventColumn, deleteColumn, mainDailyTable, selectedDate, deleteEventCell, moveColumn } =
        useDailyTableContext();

    const selectedEventData =
        mainDailyTable[selectedDate]?.[columnId]?.["1"]?.headerCol?.headerEvent;

    // Menu state
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = React.useRef<HTMLDivElement>(null);

    useClickOutside(
        menuRef,
        () => {
            if (isMenuOpen) setIsMenuOpen(false);
        },
        isMenuOpen,
    );

    const [value, setValue] = useState(selectedEventData || "");
    const prevValueRef = React.useRef(selectedEventData || "");

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

        if (prevValueRef.current !== newValue) {
            populateEventColumn(columnId, newValue);
            prevValueRef.current = newValue;
        }
    };

    const { handleOpenPopup } = useDeletePopup();

    const deleteCol = async () => {
        const response = await deleteColumn(columnId);
        if (!response) {
            errorToast(messages.dailySchedule.deleteError);
        }
    };

    const handleDeleteClick = () => {
        const deleteLabel = selectedEventData || "האירוע";
        const msg = `האם למחוק את ${deleteLabel}?`;

        if (onDelete) {
            handleOpenPopup("deleteDailyCol", msg, async () => onDelete(columnId));
        } else {
            handleOpenPopup("deleteDailyCol", msg, deleteCol);
        }
    };

    const toggleMenu = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsMenuOpen((prev) => !prev);
    };

    return (
        <div className={styles.headerContentWrapper}>
            <div className={styles.menuWrapper} ref={menuRef}>
                <Icons.menuVertical
                    className={styles.openMenu}
                    onClick={toggleMenu}
                    size={16}
                    title="אפשרויות"
                />
                {isMenuOpen && (
                    <div className={styles.menuDropdown}>
                        {/* Delete Option */}
                        <div
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsMenuOpen(false);
                                handleDeleteClick();
                            }}
                            className={`${styles.menuItem} ${styles.menuItemDelete}`}
                        >
                            <Icons.delete size={14} />
                            <span>מחיקה</span>
                        </div>

                        <div className={styles.menuSeparator} />

                        {/* Move Right Option */}
                        <div
                            onClick={(e) => {
                                e.stopPropagation();
                                if (isFirst) return;
                                setIsMenuOpen(false);
                                moveColumn && moveColumn(columnId, "right");
                            }}
                            className={`${styles.menuItem} ${isFirst ? styles.menuItemDisabled : ""}`}
                        >
                            <Icons.arrowRight size={14} />
                            <span>הזז ימינה</span>
                        </div>

                        {/* Move Left Option */}
                        <div
                            onClick={(e) => {
                                e.stopPropagation();
                                if (isLast) return;
                                setIsMenuOpen(false);
                                moveColumn && moveColumn(columnId, "left");
                            }}
                            className={`${styles.menuItem} ${isLast ? styles.menuItemDisabled : ""}`}
                        >
                            <Icons.arrowLeft size={14} />
                            <span>הזז שמאלה</span>
                        </div>
                    </div>
                )}
            </div>
            <div className={styles.inputSelectWrapper}>
                <InputText
                    placeholder="כותרת האירוע"
                    value={value}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    backgroundColor="transparent"
                    hasBorder={false}
                    fontSize="18px"
                />
            </div>
        </div>
    );
};

export default DailyEventHeader;
