import React, { useState } from "react";
import styles from "./TopNav.module.css";
import HamburgerNav, { HamburgerButton } from "../HamburgerNav/HamburgerNav";
import Logo from "../../core/Logo/Logo";
import routePath from "../../../routes";
import { usePathname } from "next/navigation";

const TopNav: React.FC = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const pathname = usePathname();

    const getCurrentRouteTitle = () => {
        const currentPath = pathname.split("/").filter(Boolean)[0] || "";
        const routeKey = Object.keys(routePath).find(
            (key) => routePath[key].p === `/${currentPath}` || 
                   (currentPath === "" && routePath[key].p === "/")
        );
        
        return routeKey ? `עמוד ${routePath[routeKey].title}` : "";
    };

    const toggleMenu = () => {
        setIsMenuOpen((prev) => !prev);
    };

    const closeMenu = () => {
        setIsMenuOpen(false);
    };

    return (
        <>
            <header className={styles.contentHeader}>
                <div className={styles.headerLeft}>
                    <HamburgerButton onClick={toggleMenu} isOpen={isMenuOpen} />
                    <h2 className={styles.routeTitle}>{getCurrentRouteTitle()}</h2>
                </div>
                <div>
                    <Logo size="S" />
                </div>
            </header>
            <HamburgerNav isOpen={isMenuOpen} onClose={closeMenu} />
        </>
    );
};

export default TopNav;
