import React, { useState, useRef } from "react";
import Icons from "@/style/icons";
import styles from "./CommonDailySchoolHeaderMenu.module.css";
import { useClickOutside } from "@/hooks/useClickOutside";

type CommonDailySchoolHeaderMenuProps = {
    onCopy?: () => void;
    onViewMaterial?: () => void;
    onReason?: () => void;
    showViewMaterial?: boolean;
    showReason?: boolean;
    disableCopy?: boolean;
};

const CommonDailySchoolHeaderMenu: React.FC<CommonDailySchoolHeaderMenuProps> = ({
    onCopy,
    onViewMaterial,
    onReason,
    showViewMaterial = false,
    showReason = false,
    disableCopy = false,
}) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useClickOutside(
        menuRef,
        () => {
            if (isMenuOpen) setIsMenuOpen(false);
        },
        isMenuOpen,
    );

    const toggleMenu = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsMenuOpen((prev) => !prev);
    };

    return (
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
                    {/* Copy Option */}
                    {onCopy && (
                        <div
                            onClick={(e) => {
                                e.stopPropagation();
                                if (disableCopy) return;
                                setIsMenuOpen(false);
                                onCopy();
                            }}
                            className={`${styles.menuItem} ${disableCopy ? styles.menuItemDisabled : ""}`}
                        >
                            <Icons.copy size={14} />
                            <span>העתקה</span>
                        </div>
                    )}

                    {/* View Material Option - only show in history mode */}
                    {showViewMaterial && onViewMaterial && (
                        <>
                            {onCopy && <div className={styles.menuSeparator} />}
                            <div
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setIsMenuOpen(false);
                                    onViewMaterial();
                                }}
                                className={styles.menuItem}
                            >
                                <Icons.eye size={14} />
                                <span>חומר הלימוד</span>
                            </div>
                        </>
                    )}
                    {/* Reason Option */}
                    {showReason && onReason && (
                        <div
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsMenuOpen(false);
                                onReason();
                            }}
                            className={styles.menuItem}
                        >
                            <Icons.info size={14} />
                            <span>סיבת היעדרות</span>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default CommonDailySchoolHeaderMenu;
