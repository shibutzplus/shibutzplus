import React, { useState } from "react";
import ActionBtn from "@/components/ui/buttons/ActionBtn/ActionBtn";
import { ColumnTypeValues } from "@/models/types/dailySchedule";
import Icons from "@/style/icons";
import { EventColor, ExistingTeacherColor, MissingTeacherColor } from "@/style/root";
import { useDailyTableContext } from "@/context/DailyTableContext";
import { PositionSide } from "@/models/types/ui";
import styles from "./DailyActionBtns.module.css";

type DailyActionBtnsProps = {
    position: PositionSide;
    useShortLabels?: boolean;
    useMobileMenu?: boolean;
};

const DailyActionBtns: React.FC<DailyActionBtnsProps> = ({ position, useShortLabels = false, useMobileMenu = false }) => {
    const { addNewEmptyColumn, isLoading } = useDailyTableContext();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const containerRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsMenuOpen(false);
            }
        };

        if (isMenuOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        } else {
            document.removeEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isMenuOpen]);

    const getButtonClass = (position: PositionSide) => {
        const classes = [];
        if (useShortLabels) classes.push(styles.shortBtn);

        switch (position) {
            case "left":
                classes.push(styles.borderLeft);
                break;
            case "right":
                classes.push(styles.borderRight);
                break;
            case "top":
                classes.push(styles.borderTop);
                break;
            case "bottom":
                classes.push(styles.borderBottom);
                break;
        }
        return classes.join(" ");
    };

    const getButtonStyle = (typeColor: string): React.CSSProperties => {
        return { "--btn-color": typeColor } as React.CSSProperties;
    };

    const handleActionClick = (action: () => void) => {
        action();
        setIsMenuOpen(false);
    };

    const renderButtons = () => (
        <>
            <ActionBtn
                type={ColumnTypeValues.missingTeacher}
                Icon={<Icons.missingTeacher size={14} />}
                label={useShortLabels ? "מורה חסר" : "שיבוץ למורה חסר"}
                isDisabled={isLoading}
                style={getButtonStyle(MissingTeacherColor)}
                func={() => handleActionClick(() => addNewEmptyColumn(ColumnTypeValues.missingTeacher))}
                className={useMobileMenu ? styles.menuItemBtn : getButtonClass(position)}
            />
            <ActionBtn
                type={ColumnTypeValues.existingTeacher}
                Icon={<Icons.teacher size={14} />}
                label={useShortLabels ? "מורה נוכח" : "שיבוץ למורה נוכח"}
                isDisabled={isLoading}
                style={getButtonStyle(ExistingTeacherColor)}
                func={() => handleActionClick(() => addNewEmptyColumn(ColumnTypeValues.existingTeacher))}
                className={useMobileMenu ? styles.menuItemBtn : getButtonClass(position)}
            />
            <ActionBtn
                type={ColumnTypeValues.event}
                Icon={<Icons.event size={16} />}
                label={useShortLabels ? "ארוע" : "שיבוץ ארוע"}
                isDisabled={isLoading}
                style={getButtonStyle(EventColor)}
                func={() => handleActionClick(() => addNewEmptyColumn(ColumnTypeValues.event))}
                className={useMobileMenu ? styles.menuItemBtn : getButtonClass(position)}
            />
        </>
    );

    if (useMobileMenu) {
        return (
            <div className={styles.mobileMenuContainer} ref={containerRef}>
                <ActionBtn
                    Icon={<Icons.plus size={16} />}
                    label="שיבוץ"
                    isDisabled={isLoading}
                    func={() => setIsMenuOpen((prev) => !prev)}
                    className={styles.mobileMenuTrigger}
                />
                {isMenuOpen && (
                    <div className={styles.mobileDropdown}>
                        {renderButtons()}
                    </div>
                )}
            </div>
        );
    }

    return renderButtons();
};

export default DailyActionBtns;
