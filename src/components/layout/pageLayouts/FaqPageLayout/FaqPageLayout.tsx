"use client";

import React, { useState } from "react";
import styles from "./FaqPageLayout.module.css";
import Logo from "@/components/ui/Logo/Logo";
import HamburgerNav, { HamburgerButton } from "@/components/navigation/HamburgerNav/HamburgerNav";
import router from "@/routes";
import { NavType } from "@/models/types";

type FaqPageLayoutProps = {
    children: React.ReactNode;
    type: NavType;
};

export default function FaqPageLayout({ children, type }: FaqPageLayoutProps) {
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
                            <h3>
                                {type === "private"
                                    ? router.faqManager.title
                                    : router.faqTeachers.title}
                            </h3>
                        </div>
                        <div className={styles.topNavLeft}>
                            <Logo size="S" />
                        </div>
                    </section>
                </header>
                <main className={styles.mainContent}>{children}</main>
            </div>
            <HamburgerNav
                hamburgerType={type}
                isOpen={isMenuOpen}
                onClose={() => setIsMenuOpen(false)}
            />
        </>
    );
}
