import React from "react";
import { ColumnType, DailyScheduleCell } from "@/models/types/dailySchedule";
import styles from "./CommonDailySchoolTeacherHeader.module.css";
import { COLOR_BY_TYPE } from "@/models/constant/daily";
import { useStickyHeader } from "@/hooks/scroll/useStickyHeader";
import { AppType } from "@/models/types";
import { TeacherType } from "@/models/types/teachers";
import { useTeacherTableContext } from "@/context/TeacherTableContext";
import CommonDailySchoolHeaderMenu from "../CommonDailySchoolHeaderMenu/CommonDailySchoolHeaderMenu";
import { usePopup } from "@/context/PopupContext";
import ReasonPopup from "@/components/popups/ReasonPopup/ReasonPopup";
import { useMainContext } from "@/context/MainContext";
import { useHistoryTable } from "@/context/HistoryTableContext";
import { updateHistoryReasonAction } from "@/app/actions/PUT/updateHistoryReasonAction";
import { errorToast } from "@/lib/toast";

type CommonDailySchoolTeacherHeaderProps = {
    type: ColumnType;
    appType: AppType;
    selectedDate: string;
    onTeacherClick?: (teacher: TeacherType) => Promise<void>;
    column: {
        [hour: string]: DailyScheduleCell;
    };
};

// ─── Shared base layout (no context hooks) ────────────────────────────────────

type TeacherHeaderBaseProps = {
    type: ColumnType;
    selectedTeacherName: string;
    showMenu: boolean;
    headerRef: React.RefObject<HTMLDivElement | null>;
    onViewMaterial: () => void;
    onReasonClick: () => void;
};

const TeacherHeaderBase: React.FC<TeacherHeaderBaseProps> = ({
    type,
    selectedTeacherName,
    showMenu,
    headerRef,
    onViewMaterial,
    onReasonClick,
}) => (
    <div ref={headerRef} className={styles.columnHeaderWrapper}>
        <div className={styles.columnHeader} style={{ backgroundColor: COLOR_BY_TYPE[type] }}>
            {showMenu && (
                <div className={styles.menuContainer}>
                    <CommonDailySchoolHeaderMenu
                        onViewMaterial={onViewMaterial}
                        onReason={onReasonClick}
                        showViewMaterial={true}
                        showReason={true}
                    />
                </div>
            )}
            <div className={styles.headerText}>{selectedTeacherName}</div>
        </div>
    </div>
);

// ─── Public variant — no private context hooks ────────────────────────────────

const CommonDailySchoolTeacherHeaderPublic: React.FC<
    Omit<CommonDailySchoolTeacherHeaderProps, "appType">
> = ({ type, column }) => {
    const selectedTeacherName = column?.["1"]?.headerCol?.headerTeacher?.name ?? "";
    const headerRef = React.useRef<HTMLDivElement>(null);
    useStickyHeader(headerRef);

    return (
        <TeacherHeaderBase
            type={type}
            selectedTeacherName={selectedTeacherName}
            showMenu={false}
            headerRef={headerRef}
            onViewMaterial={() => { }}
            onReasonClick={() => { }}
        />
    );
};

// ─── Private variant — uses MainContext / HistoryTable / Popup ────────────────

const CommonDailySchoolTeacherHeaderPrivate: React.FC<
    Omit<CommonDailySchoolTeacherHeaderProps, "appType">
> = ({ type, column, selectedDate, onTeacherClick }) => {
    const { school } = useMainContext();
    const { fetchTeacherScheduleDate } = useTeacherTableContext();
    const { openPopup, closePopup } = usePopup();
    const { setMainDailyTable } = useHistoryTable();

    const selectedTeacherData = column?.["1"]?.headerCol?.headerTeacher;
    const selectedTeacherName = selectedTeacherData?.name ?? "";
    const isClickable = !!selectedTeacherData?.name;
    const headerRef = React.useRef<HTMLDivElement>(null);
    useStickyHeader(headerRef);

    const handleViewMaterial = async () => {
        if (isClickable && selectedTeacherData?.name && onTeacherClick) {
            onTeacherClick(selectedTeacherData);
            await fetchTeacherScheduleDate(selectedTeacherData, selectedDate);
        }
    };

    const handleReasonClick = () => {
        if (!isClickable || !selectedTeacherData?.name || !school?.id) return;

        const cellWithHeader = Object.values(column).find((c) => c?.headerCol);
        const currentReason = cellWithHeader?.headerCol?.reason || "";

        openPopup(
            "reasonPopup",
            "S",
            <ReasonPopup
                initialReason={currentReason}
                onConfirm={async (newReason) => {
                    closePopup();
                    const response = await updateHistoryReasonAction(
                        school.id,
                        selectedDate,
                        selectedTeacherData.name,
                        newReason
                    );

                    if (response.success) {
                        setMainDailyTable((prev) => {
                            const updated = { ...prev };
                            if (updated[selectedDate]) {
                                updated[selectedDate] = { ...updated[selectedDate] };
                                Object.keys(updated[selectedDate]).forEach((colId) => {
                                    const col = updated[selectedDate][colId];
                                    const colHeader = Object.values(col).find((c) => c?.headerCol)?.headerCol;
                                    if (colHeader?.headerTeacher?.name === selectedTeacherData.name) {
                                        updated[selectedDate][colId] = { ...col };
                                        Object.keys(updated[selectedDate][colId]).forEach((hour) => {
                                            const cell = updated[selectedDate][colId][hour];
                                            if (cell?.headerCol) {
                                                updated[selectedDate][colId][hour] = {
                                                    ...cell,
                                                    headerCol: { ...cell.headerCol, reason: newReason },
                                                };
                                            }
                                        });
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
    };

    return (
        <TeacherHeaderBase
            type={type}
            selectedTeacherName={selectedTeacherName}
            showMenu={isClickable}
            headerRef={headerRef}
            onViewMaterial={handleViewMaterial}
            onReasonClick={handleReasonClick}
        />
    );
};

// ─── Public export — picks the right variant based on appType ─────────────────

const CommonDailySchoolTeacherHeader: React.FC<CommonDailySchoolTeacherHeaderProps> = (props) => {
    if (props.appType === "public") {
        return <CommonDailySchoolTeacherHeaderPublic {...props} />;
    }
    return <CommonDailySchoolTeacherHeaderPrivate {...props} />;
};

export default CommonDailySchoolTeacherHeader;
