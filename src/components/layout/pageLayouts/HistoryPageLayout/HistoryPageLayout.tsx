"use client";

import React, { useState } from "react";
import styles from "./HistoryPageLayout.module.css";
import InputDate from "@/components/ui/inputs/InputDate/InputDate";
import Logo from "@/components/ui/Logo/Logo";
import HamburgerNav, { HamburgerButton } from "@/components/navigation/HamburgerNav/HamburgerNav";
import router from "@/routes";

import { useMobileSize } from "@/hooks/useMobileSize";

type HistoryPageLayoutProps = {
    children: React.ReactNode;
};

export default function HistoryPageLayout({ children }: HistoryPageLayoutProps) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const isMobile = useMobileSize();

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
                            <h3>{router.history.title}</h3>
                            {!isMobile ? (
                                <div className={styles.selectContainer}>
                                    <InputDate />
                                </div>
                            ) : null}
                        </div>
                        <div className={styles.topNavLeft}>
                            <Logo size="S" />
                        </div>
                    </section>
                    {isMobile ? (
                        <div className={styles.bottomNav}>
                            <InputDate />
                        </div>
                    ) : null}
                </header>
                <main className={styles.mainContent}>{children}</main>
            </div>
            <HamburgerNav
                hamburgerType="private"
                isOpen={isMenuOpen}
                onClose={() => setIsMenuOpen(false)}
            />
        </>
    );
}
