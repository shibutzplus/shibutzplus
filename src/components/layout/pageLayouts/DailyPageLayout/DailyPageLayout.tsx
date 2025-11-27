"use client";

import React, { useState } from "react";
import styles from "./DailyPageLayout.module.css";
import Logo from "@/components/ui/Logo/Logo";
import HamburgerNav, { HamburgerButton } from "@/components/navigation/HamburgerNav/HamburgerNav";
import router from "@/routes";
import { useDailyTableContext } from "@/context/DailyTableContext";
import DynamicInputSelect from "@/components/ui/select/InputSelect/DynamicInputSelect";
import MobileNavLayout from "../../MobileNavLayout/MobileNavLayout";
import DailyActionBtns from "@/components/actions/DailyActionBtns/DailyActionBtns";
import DailyPublishActionBtns from "@/components/actions/DailyPublishActionBtns/DailyPublishActionBtns";

type DailyPageLayoutProps = {
    children: React.ReactNode;
};

export default function DailyPageLayout({ children }: DailyPageLayoutProps) {
    const { daysSelectOptions, selectedDate, isLoading, isEditMode, handleDayChange } =
        useDailyTableContext();

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
                            <h3>{router.dailySchedule.title}</h3>
                            <div className={styles.topNavSelectContainer}>
                                <div className={styles.selectContainer}>
                                    <DynamicInputSelect
                                        options={daysSelectOptions()}
                                        value={selectedDate}
                                        isDisabled={isLoading || !isEditMode}
                                        onChange={handleDayChange}
                                        isSearchable={false}
                                        placeholder="בחרו יום..."
                                        hasBorder
                                    />
                                </div>

                                {isEditMode ? (
                                    <div className={styles.desktopActionBtns}>
                                        <DailyActionBtns position="left" />
                                    </div>
                                ) : null}
                            </div>
                        </div>
                        <div className={styles.topNavLeft}>
                            <DailyPublishActionBtns />
                            <Logo size="S" />
                        </div>
                    </section>
                    <div className={styles.bottomNav}>
                        <div className={styles.mobileSelectContainer}>
                            <DynamicInputSelect
                                options={daysSelectOptions()}
                                value={selectedDate}
                                isDisabled={isLoading}
                                onChange={handleDayChange}
                                isSearchable={false}
                                placeholder="בחר יום..."
                                hasBorder
                            />
                        </div>
                    </div>
                </header>
                <main className={styles.mainContent}>{children}</main>
            </div>
            <div className={styles.mobileActionBtns}>
                <MobileNavLayout>
                    <DailyActionBtns position="top" />
                </MobileNavLayout>
            </div>
            <HamburgerNav
                hamburgerType="private"
                isOpen={isMenuOpen}
                onClose={() => setIsMenuOpen(false)}
            />
        </>
    );
}
