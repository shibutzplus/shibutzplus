import React, { useState } from "react";
import styles from "./TopNav.module.css";
import { useSession } from "next-auth/react";
import HamburgerNav, { HamburgerButton } from "../HamburgerNav/HamburgerNav";
import Logo from "../../core/Logo/Logo";
import routePath from "../../../routes";

const TopNav: React.FC = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const toggleMenu = () => {
        setIsMenuOpen((prev) => !prev);
    };

    const closeMenu = () => {
        setIsMenuOpen(false);
    };

    return (
        <>
            <header className={styles.contentHeader}>
                <HamburgerButton onClick={toggleMenu} isOpen={isMenuOpen} />
                <div>
                    <Logo size="S" />
                </div>
            </header>
            <HamburgerNav isOpen={isMenuOpen} onClose={closeMenu} />
        </>
    );
};

export default TopNav;
