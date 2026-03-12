import React, { useState, useMemo } from "react";
import { filterDailyHeaderTeachers } from "@/utils/sort";
import Loading from "@/components/loading/Loading/Loading";
import DynamicInputSelect from "../../../ui/select/InputSelect/DynamicInputSelect";
import { useDailyTableContext } from "@/context/DailyTableContext";
import { ColumnType, ColumnTypeValues } from "@/models/types/dailySchedule";
import { getDayNumberByDateString } from "@/utils/time";
import { useMainContext } from "@/context/MainContext";
import { errorToast, successToast } from "@/lib/toast";
import messages from "@/resources/messages";
import { BrightTextColor, BrightTextColorHover } from "@/style/root";
import styles from "../MngrDailyBldTable/MngrDailyBldTable.module.css";
import useConfirmPopup from "@/hooks/useConfirmPopup";
import MngrDailyBldColMenu from "../MngrDailyBldColMenu/MngrDailyBldColMenu";
import Icons from "@/style/icons";
import { TeacherType } from "@/models/types/teachers";
import { useTeacherTableContext } from "@/context/TeacherTableContext";
import { usePopup } from "@/context/PopupContext";
import ReasonPopup from "@/components/popups/ReasonPopup/ReasonPopup";
import { updateDailyColumnReasonAction } from "@/app/actions/PUT/updateDailyColumnReasonAction";

type MngrDailyBldTeacherHeaderProps = {
    columnId: string;
    type: ColumnType;
    onDelete?: (colId: string) => void;
    onTeacherClick?: (teacher: TeacherType) => void;
    isFirst?: boolean;
    isLast?: boolean;
};

const MngrDailyBldTeacherHeader: React.FC<MngrDailyBldTeacherHeaderProps> = ({
    columnId,
    type,
    onDelete,
    onTeacherClick,
    isFirst,
    isLast,
}) => {
    const { teachers, school } = useMainContext();
    const { mainDailyTable, selectedDate, moveColumn, populateTeacherColumn, mapAvailableTeachers, setMainDailyTable } =
        useDailyTableContext();
    const { fetchTeacherScheduleDate } = useTeacherTableContext();
    const [isLoading, setIsLoading] = useState(false);
    const { handleOpenPopup } = useConfirmPopup();
    const { openPopup, closePopup } = usePopup();

    const selectedTeacherData =
        mainDailyTable[selectedDate]?.[columnId]?.["1"]?.headerCol?.headerTeacher;

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

    const handleDeleteClick = () => {
        const label = selectedTeacherData?.name || "המורה";
        const msg = `האם למחוק את ${label}?`;

        const isMissingOrExisting =
            type === ColumnTypeValues.missingTeacher ||
            type === ColumnTypeValues.existingTeacher;

        let hasReplacements = false;
        if (isMissingOrExisting) {
            const dayData = mainDailyTable[selectedDate]?.[columnId];
            if (dayData) {
                // Check if any hour has a subTeacher
                hasReplacements = Object.values(dayData).some(
                    (cell) => cell.subTeacher
                );
            }
        }

        // If explicitly requested to skip confirmation (future use) or based on logic
        if (isMissingOrExisting && !hasReplacements) {
            onDelete?.(columnId);
        } else {
            handleOpenPopup("deleteDailyCol", msg, async () => onDelete?.(columnId));
        }
    };

    const handlePreviewClick = async () => {
        if (selectedTeacherData && onTeacherClick) {
            await fetchTeacherScheduleDate(selectedTeacherData, selectedDate);
            onTeacherClick(selectedTeacherData);
        }
    };

    return (
        <div className={styles.headerContentWrapper}>
            {isLoading ? (
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
                >
                    {onTeacherClick && selectedTeacherData
                        ? ({ closeMenu }) => (
                            <>
                                <div
                                    onClick={() => {
                                        // Read reason from the first cell in the column that has a headerCol
                                        const columnCells = mainDailyTable[selectedDate]?.[columnId] || {};
                                        const cellWithHeader = Object.values(columnCells).find(c => c?.headerCol);
                                        const currentReason = cellWithHeader?.headerCol?.reason || "";
                                        openPopup(
                                            "reasonPopup",
                                            "S",
                                            <ReasonPopup
                                                initialReason={currentReason}
                                                onConfirm={async (reason) => {
                                                    closePopup();
                                                    if (!school?.id) return;
                                                    const response = await updateDailyColumnReasonAction(
                                                        school.id,
                                                        selectedDate,
                                                        columnId,
                                                        reason
                                                    );
                                                    if (response.success) {
                                                        setMainDailyTable((prev: any) => {
                                                            const updated = { ...prev };
                                                            if (updated[selectedDate]?.[columnId]) {
                                                                updated[selectedDate] = { ...updated[selectedDate] };
                                                                updated[selectedDate][columnId] = { ...updated[selectedDate][columnId] };
                                                                Object.keys(updated[selectedDate][columnId]).forEach((hour) => {
                                                                    const cell = updated[selectedDate][columnId][hour];
                                                                    if (cell?.headerCol) {
                                                                        updated[selectedDate][columnId][hour] = {
                                                                            ...cell,
                                                                            headerCol: { ...cell.headerCol, reason },
                                                                        };
                                                                    }
                                                                });
                                                            }
                                                            return updated;
                                                        });
                                                    } else {
                                                        errorToast(response.message || "שגיאה בעדכון");
                                                    }
                                                }}
                                                onCancel={closePopup}
                                            />
                                        );
                                        closeMenu();
                                    }}
                                    className={styles.menuItem}
                                >
                                    <Icons.info size={14} />
                                    <span>סיבת היעדרות</span>
                                </div>
                                <div
                                    onClick={() => {
                                        handlePreviewClick();
                                        closeMenu();
                                    }}
                                    className={styles.menuItem}
                                >
                                    <Icons.eye size={14} />
                                    <span>חומר הלימוד</span>
                                </div>
                            </>
                        )
                        : null}
                </MngrDailyBldColMenu>
            )}

            <div className={styles.inputSelectWrapper}>
                <div style={{ width: "100%" }}>
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
                        menuPortalTarget={null}
                        menuWidth="180px"
                        menuAlign="left"
                    />
                </div>
            </div>
        </div>
    );
};

export default MngrDailyBldTeacherHeader;

