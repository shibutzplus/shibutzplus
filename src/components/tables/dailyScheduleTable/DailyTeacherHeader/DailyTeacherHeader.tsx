import React, { useState, useMemo } from "react";
import { filterDailyHeaderTeachers } from "@/utils/sort";
import DynamicInputSelect from "../../../ui/select/InputSelect/DynamicInputSelect";
import { useDailyTableContext } from "@/context/DailyTableContext";
import { ColumnType } from "@/models/types/dailySchedule";
import { getDayNumberByDateString } from "@/utils/time";
import { useMainContext } from "@/context/MainContext";
import { errorToast, successToast } from "@/lib/toast";
import messages from "@/resources/messages";
import { BrightTextColor, BrightTextColorHover } from "@/style/root";
import styles from "../DailyTable/DailyTable.module.css";
import useDeletePopup from "@/hooks/useDeletePopup";
import Icons from "@/style/icons";

import { TeacherType } from "@/models/types/teachers";

import { useTeacherTableContext } from "@/context/TeacherTableContext";

type DailyTeacherHeaderProps = {
    columnId: string;
    type: ColumnType;
    onDelete?: (colId: string) => void;
    onTeacherClick?: (teacher: TeacherType) => void;
    isFirst?: boolean;
    isLast?: boolean;
};

const DailyTeacherHeader: React.FC<DailyTeacherHeaderProps> = ({
    columnId,
    type,
    onDelete,
    onTeacherClick,
    isFirst,
    isLast,
}) => {
    const { teachers } = useMainContext();
    const { deleteColumn, mainDailyTable, selectedDate, moveColumn, populateTeacherColumn, mapAvailableTeachers } =
        useDailyTableContext();
    const { fetchTeacherScheduleDate } = useTeacherTableContext(); // Added context
    const [isLoading, setIsLoading] = useState(false);
    const { handleOpenPopup } = useDeletePopup();

    // Menu state
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = React.useRef<HTMLDivElement>(null);

    const selectedTeacherData =
        mainDailyTable[selectedDate]?.[columnId]?.["1"]?.headerCol?.headerTeacher;

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

    const handleTeacherChange = async (value: string) => {
        const teacherId = value;
        if (!teacherId) return;
        setIsLoading(true);
        const dayNumber = getDayNumberByDateString(selectedDate);
        const response = await populateTeacherColumn(
            selectedDate,
            columnId,
            dayNumber,
            teacherId,
            type,
        );
        if (response) {
            if (response.length === 0) {
                successToast(messages.dailySchedule.noScheduleFound);
            }
        } else {
            errorToast(messages.dailySchedule.error);
        }
        setIsLoading(false);
    };

    // Build a set of teachers that actually teach today (in the annual schedule)
    const teachersTeachingTodayIds = useMemo(() => {
        const ids = new Set<string>();
        const dayNumber = getDayNumberByDateString(selectedDate);
        const dayMap = mapAvailableTeachers?.[dayNumber];
        if (!dayMap) return ids;

        Object.values(dayMap).forEach((hourTeachers) => {
            hourTeachers.forEach((id) => ids.add(id));
        });

        return ids;
    }, [mapAvailableTeachers, selectedDate]);

    // Filtered teacher options: only regular teachers, no duplicates, and only those teaching today
    const filteredTeacherOptions = useMemo(() => {
        return filterDailyHeaderTeachers(
            teachers,
            mainDailyTable,
            selectedTeacherData,
            teachersTeachingTodayIds,
            selectedDate,
        );
    }, [teachers, mainDailyTable, selectedTeacherData, teachersTeachingTodayIds, selectedDate]);

    const handleDeleteColumn = async () => {
        const response = await deleteColumn(columnId);
        if (!response) {
            errorToast(messages.dailySchedule.deleteError);
        }
    };

    const handleDeleteClick = () => {
        const label = selectedTeacherData?.name || "המורה";
        const msg = `האם למחוק את ${label}?`;

        if (onDelete) {
            handleOpenPopup("deleteDailyCol", msg, async () => onDelete(columnId));
        } else {
            handleOpenPopup("deleteDailyCol", msg, handleDeleteColumn);
        }
    };

    const handlePreviewClick = async () => {
        if (selectedTeacherData && onTeacherClick) {
            await fetchTeacherScheduleDate(selectedTeacherData, selectedDate);
            onTeacherClick(selectedTeacherData);
        }
        setIsMenuOpen(false);
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
                    style={{ cursor: "pointer" }}
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

                        {/* Preview Option - Only if onTeacherClick is provided and teacher is selected */}
                        {onTeacherClick && selectedTeacherData && (
                            <>
                                <div className={styles.menuSeparator} />
                                <div
                                    onClick={handlePreviewClick}
                                    className={styles.menuItem}
                                >
                                    <Icons.eye size={14} />
                                    <span>חומר הלימוד</span>
                                </div>
                            </>
                        )}

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
                <DynamicInputSelect
                    options={filteredTeacherOptions}
                    value={selectedTeacherData?.id || ""}
                    onChange={handleTeacherChange}
                    placeholder="בחירת מורה"
                    isSearchable
                    isDisabled={isLoading}
                    backgroundColor="transparent"
                    color={BrightTextColor}
                    colorHover={BrightTextColorHover}
                    placeholderColor={BrightTextColor}
                    fontSize="18px"
                    caretColor="#cccccc"
                />
            </div>
        </div>
    );
};

export default DailyTeacherHeader;

