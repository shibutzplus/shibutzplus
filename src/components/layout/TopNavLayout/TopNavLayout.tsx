"use client";

import React, { useState } from "react";
import styles from "./TopNavLayout.module.css";
import HamburgerNav, { HamburgerButton } from "@/components/navigation/HamburgerNav/HamburgerNav";
import Logo from "@/components/core/Logo/Logo";
import { NavType } from "@/models/types";

type TopNavLayoutProps = {
    type: NavType;
    childrens: { left: React.ReactNode | undefined; right: React.ReactNode | undefined };
};

const TopNavLayout: React.FC<TopNavLayoutProps> = ({ childrens, type }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    return (
        <>
            <header className={styles.topNavLayout}>
                <div className={styles.topNavRight}>
                    <HamburgerButton onClick={() => setIsMenuOpen((v) => !v)} isOpen={isMenuOpen} />
                    {childrens.right}
                </div>
                <div className={styles.topNavLeft}>
                    {childrens.left}
                    <Logo size="S" />
                </div>
            </header>

            <HamburgerNav
                isOpen={isMenuOpen}
                onClose={() => setIsMenuOpen(false)}
                variant={type === "portal" ? "portal" : "admin"}
            />
        </>
    );
};

export default TopNavLayout;
