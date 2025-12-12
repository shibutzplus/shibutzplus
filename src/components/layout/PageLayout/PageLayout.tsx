"use client";

import React, { useState } from "react";
import styles from "./PageLayout.module.css";
import Logo from "@/components/ui/Logo/Logo";
import HamburgerNav, { HamburgerButton } from "@/components/navigation/HamburgerNav/HamburgerNav";
import { AppType } from "@/models/types";
import { SchoolSettingsType } from "@/models/types/settings";

type PageLayoutProps = {
    children: React.ReactNode;
    appType: AppType;
    HeaderRightActions?: React.ReactNode;
    HeaderLeftActions?: React.ReactNode;
    BottomActions?: React.ReactNode;
    MobileActions?: React.ReactNode;
    leftSideWidth?: number;
    hideLogo?: boolean;
    contentClassName?: string;
    schoolSettings?: SchoolSettingsType;
};

export default function PageLayout({
    children,
    appType,
    HeaderRightActions,
    HeaderLeftActions,
    BottomActions,
    MobileActions,
    leftSideWidth = 230,
    hideLogo = false,
    contentClassName = "",
    schoolSettings,
}: PageLayoutProps) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <>
            <div
                className={`${styles.pageLayout} ${hideLogo ? styles.hideLogo : ""}`}
            >
                <header className={styles.topBarLayout}>
                    <section className={styles.topBarSection}>
                        <div className={styles.topNavRight}>
                            <HamburgerButton
                                onClick={() => setIsMenuOpen((v) => !v)}
                                isOpen={isMenuOpen}
                            />
                            {HeaderRightActions}
                        </div>
                        <div className={styles.topNavLeft} style={{ width: leftSideWidth }}>
                            {HeaderLeftActions}
                            <div className={styles.logo}>
                                <Logo />
                            </div>
                        </div>
                    </section>
                    {BottomActions}
                </header>
                <main
                    className={`${styles.mainContent} ${contentClassName}`}
                >
                    {children}
                </main>
            </div>
            {MobileActions}
            <HamburgerNav
                hamburgerType={appType}
                isOpen={isMenuOpen}
                onClose={() => setIsMenuOpen(false)}
                schoolSettings={schoolSettings}
            />
        </>
    );
}
