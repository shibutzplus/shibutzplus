"use client";

import React, { useState } from "react";
import styles from "./AnnualTeacherPageLayout.module.css";
import Logo from "@/components/ui/Logo/Logo";
import HamburgerNav, { HamburgerButton } from "@/components/navigation/HamburgerNav/HamburgerNav";
import { useMobileSize } from "@/hooks/browser/useMobileSize";
import DynamicInputSelect from "@/components/ui/select/InputSelect/DynamicInputSelect";
import router from "@/routes";
import { useAnnualByTeacher } from "@/context/AnnualByTeacherContext";

type AnnualTeacherPageLayoutProps = {
    children: React.ReactNode;
};

export default function AnnualTeacherPageLayout({ children }: AnnualTeacherPageLayoutProps) {
    const { teachersSelectOptions, selectedTeacherId, handleTeacherChange, isSaving, isLoading } =
        useAnnualByTeacher();
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
                            <h3>{router.annualByTeacher.title}</h3>
                            {!isMobile ? (
                                <div className={styles.selectContainer}>
                                    <DynamicInputSelect
                                        options={teachersSelectOptions()}
                                        value={selectedTeacherId}
                                        onChange={handleTeacherChange}
                                        isSearchable={false}
                                        isDisabled={isSaving || isLoading}
                                        placeholder="בחרו מורה..."
                                        hasBorder
                                    />
                                </div>
                            ) : null}
                        </div>
                        <div className={styles.topNavLeft}>
                            <Logo size="S" />
                        </div>
                    </section>
                    {isMobile ? (
                        <div className={styles.bottomNav}>
                            <DynamicInputSelect
                                options={teachersSelectOptions()}
                                value={selectedTeacherId}
                                onChange={handleTeacherChange}
                                isSearchable={false}
                                isDisabled={isSaving || isLoading}
                                placeholder="בחר מורה..."
                                hasBorder
                            />
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
