"use client";

import React, { useState } from "react";
import styles from "./AnnualViewPageLayout.module.css";
import Logo from "@/components/ui/Logo/Logo";
import HamburgerNav, { HamburgerButton } from "@/components/navigation/HamburgerNav/HamburgerNav";
import DynamicInputSelect from "@/components/ui/select/InputSelect/DynamicInputSelect";
import { useAnnualView } from "@/context/AnnualViewContext";

type AnnualViewPageLayoutProps = {
    children: React.ReactNode;
};

export default function AnnualViewPageLayout({ children }: AnnualViewPageLayoutProps) {
    const {
        classesSelectOptions,
        selectedClassId,
        handleClassChange,
        teachersSelectOptions,
        selectedTeacherId,
        handleTeacherChange,
        isLoading
    } = useAnnualView();
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
                            <h3 className={styles.pageTitle}>מערכת שנתית</h3>
                            <div className={styles.selectContainer}>
                                <DynamicInputSelect
                                    options={classesSelectOptions()}
                                    value={selectedClassId}
                                    onChange={handleClassChange}
                                    isSearchable={true}
                                    isDisabled={isLoading}
                                    placeholder="בחר כיתה..."
                                    hasBorder
                                    isClearable
                                />
                            </div>
                            <div className={styles.selectContainer}>
                                <DynamicInputSelect
                                    options={teachersSelectOptions()}
                                    value={selectedTeacherId}
                                    onChange={handleTeacherChange}
                                    isSearchable={true}
                                    isDisabled={isLoading}
                                    placeholder="בחר מורה..."
                                    hasBorder
                                    isClearable
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
                                isDisabled={isLoading}
                                placeholder="בחר כיתה..."
                                hasBorder
                                isClearable
                            />
                        </div>
                        <div className={styles.mobileSelectContainer}>
                            <DynamicInputSelect
                                options={teachersSelectOptions()}
                                value={selectedTeacherId}
                                onChange={handleTeacherChange}
                                isSearchable={true}
                                isDisabled={isLoading}
                                placeholder="בחר מורה..."
                                hasBorder
                                isClearable
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
