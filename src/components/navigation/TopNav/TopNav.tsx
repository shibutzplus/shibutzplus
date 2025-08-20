"use client";

import React, { useEffect, useState } from "react";
import styles from "./TopNav.module.css";
import HamburgerNav, { HamburgerButton } from "../HamburgerNav/HamburgerNav";
import Logo from "../../core/Logo/Logo";
import routePath from "../../../routes";
import { usePathname } from "next/navigation";

type TopNavProps = {
    Actions?: React.ReactNode;
};

const TopNav: React.FC<TopNavProps> = ({ Actions }) => {
    const pathname = usePathname();
    const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
    const [pageTitle, setPageTitle] = useState<string>("");

    useEffect(() => {
        const currentPath = pathname.split("/").filter(Boolean)[0] || "";
        const routeKey = Object.keys(routePath).find(
            (key) =>
                routePath[key].p === `/${currentPath}` ||
                (currentPath === "" && routePath[key].p === "/"),
        );

        if (routeKey) {
            setPageTitle(routePath[routeKey].title);
        }
    }, [pathname]);

    const toggleMenu = () => {
        setIsMenuOpen((prev) => !prev);
    };

    const closeMenu = () => {
        setIsMenuOpen(false);
    };
    return (
        <>
            <header className={styles.contentHeader}>
                <div className={styles.headerRight}>
                    <HamburgerButton onClick={toggleMenu} isOpen={isMenuOpen} />
                    <h2 className={styles.routeTitle}>{pageTitle}</h2>
                    {Actions ? Actions : null}
                </div>
                <div className={styles.headerLeft}>
                    <Logo size="S" />
                </div>
            </header>
            <HamburgerNav isOpen={isMenuOpen} onClose={closeMenu} />
        </>
    );
};

export default TopNav;
