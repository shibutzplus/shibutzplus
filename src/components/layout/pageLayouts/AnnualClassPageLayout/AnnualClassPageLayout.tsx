"use client";

import React, { useState } from "react";
import styles from "./AnnualClassPageLayout.module.css";
import Logo from "@/components/ui/Logo/Logo";
import HamburgerNav, { HamburgerButton } from "@/components/navigation/HamburgerNav/HamburgerNav";
import DynamicInputSelect from "@/components/ui/select/InputSelect/DynamicInputSelect";
import router from "@/routes";
import { useAnnualByClass } from "@/context/AnnualByClassContext";

type AnnualClassPageLayoutProps = {
    children: React.ReactNode;
};

export default function AnnualClassPageLayout({ children }: AnnualClassPageLayoutProps) {
    const { classesSelectOptions, selectedClassId, handleClassChange, isSaving, isLoading } =
        useAnnualByClass();
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
                            <h3 className={styles.pageTitle}>{router.annualByClass.title}</h3>
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
                        </div>
                        <div className={styles.topNavLeft}>
                            <Logo size="S" />
                        </div>
                    </section>
                    <div className={styles.bottomNav}>
                        <div className={styles.mobileSelectContainer}>
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
                    </div>
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
