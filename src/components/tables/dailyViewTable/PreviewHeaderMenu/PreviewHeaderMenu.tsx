import React, { useState, useRef } from "react";
import Icons from "@/style/icons";
import styles from "./PreviewHeaderMenu.module.css";
import { useClickOutside } from "@/hooks/useClickOutside";

type PreviewHeaderMenuProps = {
    onCopy?: () => void;
    onViewMaterial?: () => void;
    showViewMaterial?: boolean;
};

const PreviewHeaderMenu: React.FC<PreviewHeaderMenuProps> = ({
    onCopy,
    onViewMaterial,
    showViewMaterial = false,
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
                                setIsMenuOpen(false);
                                onCopy();
                            }}
                            className={styles.menuItem}
                        >
                            <Icons.copy size={14} />
                            <span>העתקה</span>
                        </div>
                    )}

                    {/* View Material Option - only show in history mode */}
                    {showViewMaterial && onViewMaterial && (
                        <>
                            <div className={styles.menuSeparator} />
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
                </div>
            )}
        </div>
    );
};

export default PreviewHeaderMenu;
