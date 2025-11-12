"use client";

import React, { useState } from "react";
import styles from "./DetailsPageLayout.module.css";
import Logo from "@/components/ui/Logo/Logo";
import HamburgerNav, { HamburgerButton } from "@/components/navigation/HamburgerNav/HamburgerNav";

type DetailsPageLayoutProps = {
    children: React.ReactNode;
    pageTitle: string
};

export default function DetailsPageLayout({ children, pageTitle }: DetailsPageLayoutProps) {
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
                            <h3>{pageTitle}</h3>
                        </div>
                        <div className={styles.topNavLeft}>
                            <Logo size="S" />
                        </div>
                    </section>
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
