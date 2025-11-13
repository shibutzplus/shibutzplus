"use client";

import React, { useState } from "react";
import styles from "./TopNavLayout.module.css";
import HamburgerNav, { HamburgerButton } from "@/components/navigation/HamburgerNav/HamburgerNav";
import Logo from "@/components/ui/Logo/Logo";
import { NavType } from "@/models/types";
import { useMobileSize } from "@/hooks/useMobileSize";
//NOT IN USE
type TopNavLayoutProps = {
    type: NavType;
    elements: {
        topLeft?: React.ReactNode;
        topRight?: React.ReactNode;
        topCenter?: React.ReactNode;
        bottom?: React.ReactNode;
    };
};

const TopNavLayout: React.FC<TopNavLayoutProps> = ({ elements, type }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const isMobile = useMobileSize();

    return (
        <>
            <header className={styles.topNavLayout}>
                <div className={styles.topNavRight}>
                    <HamburgerButton onClick={() => setIsMenuOpen((v) => !v)} isOpen={isMenuOpen} />
                    {elements.topRight}
                </div>
                <div className={styles.topNavLeft}>
                    {elements.topLeft}
                    <Logo size="S" />
                </div>
            </header>

            {elements.bottom && isMobile ? (
                <div className={styles.bottomNav}>{elements.bottom}</div>
            ) : null}

            <HamburgerNav
                isOpen={isMenuOpen}
                onClose={() => setIsMenuOpen(false)}
                hamburgerType={type}
            />
        </>
    );
};

export default TopNavLayout;
