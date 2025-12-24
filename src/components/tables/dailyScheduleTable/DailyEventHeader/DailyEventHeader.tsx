import React, { useState } from "react";
import InputText from "../../../ui/inputs/InputText/InputText";
import { useDailyTableContext } from "@/context/DailyTableContext";
import { errorToast } from "@/lib/toast";
import messages from "@/resources/messages";
import { ColumnType } from "@/models/types/dailySchedule";
import useDeletePopup from "@/hooks/useDeletePopup";
import Icons from "@/style/icons";
import styles from "../DailyTable/DailyTable.module.css";

type DailyEventHeaderProps = {
    columnId: string;
    onDelete?: (colId: string) => void;
};

const DailyEventHeader: React.FC<DailyEventHeaderProps> = ({ columnId, onDelete }) => {
    const { populateEventColumn, deleteColumn, mainDailyTable, selectedDate } =
        useDailyTableContext();

    const selectedEventData =
        mainDailyTable[selectedDate]?.[columnId]?.["1"]?.headerCol?.headerEvent;

    const [prevValue, setPrevValue] = useState<string>(selectedEventData || "");

    // Menu state
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = React.useRef<HTMLDivElement>(null);

    // Close menu when clicking outside
    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsMenuOpen(false);
            }
        };

        if (isMenuOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isMenuOpen]);

    const handleChange = (e: React.FocusEvent<HTMLInputElement>) => {
        const newValue = e.target.value.trim();

        // Prevent empty header if there was a previous saved value
        if (prevValue && newValue === "") {
            errorToast("כותרת העמודה אינה יכולה להיות ריקה", Infinity);
            e.target.value = prevValue; // revert to previous value
            return;
        }

        if (prevValue !== newValue) {
            populateEventColumn(columnId, newValue);
            setPrevValue(newValue);
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
                    className={styles.trashIcon}
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
                    </div>
                )}
            </div>
            <div className={styles.inputSelectWrapper}>
                <InputText
                    placeholder="כותרת האירוע"
                    onBlur={handleChange}
                    defaultValue={selectedEventData || ""}
                    backgroundColor="transparent"
                    hasBorder={false}
                    fontSize="18px"
                />
            </div>
        </div>
    );
};

export default DailyEventHeader;
