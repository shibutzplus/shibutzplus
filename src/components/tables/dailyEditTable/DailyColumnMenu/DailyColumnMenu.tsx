import React, { useState, useRef } from "react";
import Icons from "@/style/icons";
import styles from "../DailyTable/DailyTable.module.css";
import { useClickOutside } from "@/hooks/useClickOutside";

type DailyColumnMenuProps = {
    onDelete: () => void;
    onMoveRight?: () => void;
    onMoveLeft?: () => void;
    onPaste?: () => void;
    onCopy?: () => void;
    showPaste?: boolean;
    disableCopy?: boolean;
    isFirst?: boolean;
    isLast?: boolean;
    children?: React.ReactNode | ((props: { closeMenu: () => void }) => React.ReactNode); // For custom menu items
};

const DailyColumnMenu: React.FC<DailyColumnMenuProps> = ({
    onDelete,
    onMoveRight,
    onMoveLeft,
    onPaste,
    onCopy,
    showPaste,
    disableCopy,
    isFirst,
    isLast,
    children,
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
                    {/* Delete Option */}
                    <div
                        onClick={(e) => {
                            e.stopPropagation();
                            setIsMenuOpen(false);
                            onDelete();
                        }}
                        className={`${styles.menuItem} ${styles.menuItemDelete}`}
                    >
                        <Icons.delete size={14} />
                        <span>מחיקה</span>
                    </div>

                    {children && (
                        <>
                            <div className={styles.menuSeparator} />
                            {typeof children === "function"
                                ? children({ closeMenu: () => setIsMenuOpen(false) })
                                : children}
                        </>
                    )}

                    <div className={styles.menuSeparator} />

                    {/* Move Options */}
                    <div
                        onClick={(e) => {
                            e.stopPropagation();
                            if (isFirst) return;
                            setIsMenuOpen(false);
                            onMoveRight?.();
                        }}
                        className={`${styles.menuItem} ${isFirst ? styles.menuItemDisabled : ""}`}
                    >
                        <Icons.arrowRight size={14} />
                        <span>הזז ימינה</span>
                    </div>

                    <div
                        onClick={(e) => {
                            e.stopPropagation();
                            if (isLast) return;
                            setIsMenuOpen(false);
                            onMoveLeft?.();
                        }}
                        className={`${styles.menuItem} ${isLast ? styles.menuItemDisabled : ""}`}
                    >
                        <Icons.arrowLeft size={14} />
                        <span>הזז שמאלה</span>
                    </div>

                    {/* Copy/Paste Section */}
                    {(onCopy || onPaste) && <div className={styles.menuSeparator} />}

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
                            <span>העתק</span>
                        </div>
                    )}

                    {/* Paste Option */}
                    {onPaste && (
                        <div
                            onClick={(e) => {
                                e.stopPropagation();
                                if (!showPaste) return;
                                setIsMenuOpen(false);
                                onPaste();
                            }}
                            className={`${styles.menuItem} ${!showPaste ? styles.menuItemDisabled : ""}`}
                        >
                            <Icons.paste size={14} />
                            <span>הדבק</span>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default DailyColumnMenu;
