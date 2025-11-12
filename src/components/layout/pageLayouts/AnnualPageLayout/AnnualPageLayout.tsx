"use client";

import React, { useState } from "react";
import styles from "./AnnualPageLayout.module.css";
import Logo from "@/components/ui/Logo/Logo";
import HamburgerNav, { HamburgerButton } from "@/components/navigation/HamburgerNav/HamburgerNav";
import { useMobileSize } from "@/hooks/useMobileSize";
import DynamicInputSelect from "@/components/ui/select/InputSelect/DynamicInputSelect";
import router from "@/routes";
import { useAnnualTable } from "@/context/AnnualTableContext";

type AnnualPageLayoutProps = {
    children: React.ReactNode;
};

export default function AnnualPageLayout({ children }: AnnualPageLayoutProps) {
    const { classesSelectOptions, selectedClassId, handleClassChange, isSaving, isLoading } =
        useAnnualTable();
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
                            <h3>{router.annualSchedule.title}</h3>
                            {!isMobile ? (
                                <div className={styles.selectContainer}>
                                    <DynamicInputSelect
                                        options={classesSelectOptions()}
                                        value={selectedClassId}
                                        onChange={handleClassChange}
                                        isSearchable={false}
                                        isDisabled={isSaving || isLoading}
                                        placeholder="בחר כיתה..."
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
                                options={classesSelectOptions()}
                                value={selectedClassId}
                                onChange={handleClassChange}
                                isSearchable={false}
                                isDisabled={isSaving || isLoading}
                                placeholder="בחר כיתה..."
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
