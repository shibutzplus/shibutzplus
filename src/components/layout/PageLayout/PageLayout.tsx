"use client";

import React, { useState } from "react";
import styles from "./PageLayout.module.css";
import Logo from "@/components/ui/Logo/Logo";
import HamburgerNav, { HamburgerButton } from "@/components/navigation/HamburgerNav/HamburgerNav";
import { AppType } from "@/models/types";

type PageLayoutProps = {
    children: React.ReactNode;
    appType: AppType;
    HeaderRightActions?: React.ReactNode;
    HeaderLeftActions?: React.ReactNode;
    BottomActions?: React.ReactNode;
    MobileActions?: React.ReactNode;
    isFullHeight?: boolean;
    hasMobileLogo?: boolean;
    leftSideWidth?: number;
};

export default function PageLayout({
    children,
    appType,
    HeaderRightActions,
    HeaderLeftActions,
    BottomActions,
    MobileActions,
    isFullHeight = true,
    hasMobileLogo = true,
    leftSideWidth = 230,
}: PageLayoutProps) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <>
            <div className={styles.pageLayout}>
                <header className={styles.topNavLayout}>
                    <section className={styles.topNavSection}>
                        <div className={styles.topNavRight}>
                            <HamburgerButton
                                onClick={() => setIsMenuOpen((v) => !v)}
                                isOpen={isMenuOpen}
                            />
                            {HeaderRightActions}
                        </div>
                        <div className={styles.topNavLeft} style={{ width: leftSideWidth }}>
                            {HeaderLeftActions}
                            <div className={hasMobileLogo ? styles.logo : styles.noLogo}>
                                <Logo />
                            </div>
                        </div>
                    </section>
                    {BottomActions ? <div className={styles.dateNav}>{BottomActions}</div> : null}
                </header>
                <main
                    className={`${styles.mainContent} ${isFullHeight ? styles.fullHeight : styles.notFullHeight}`}
                >
                    {children}
                </main>
            </div>
            {MobileActions ? <div className={styles.mobileActionBtns}>{MobileActions}</div> : null}
            <HamburgerNav
                hamburgerType={appType}
                isOpen={isMenuOpen}
                onClose={() => setIsMenuOpen(false)}
            />
        </>
    );
}
