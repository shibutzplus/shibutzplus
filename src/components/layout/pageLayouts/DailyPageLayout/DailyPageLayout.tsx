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
                            <div className={styles.titleContainer}>
                                <h3>
                                    {router.dailySchedule.title}
                                    {!isEditMode && (
                                        <span className={styles.previewModeLabel}> (תצוגת בדיקה)</span>
                                    )}
                                </h3>
                            </div>
                            <div className={styles.topNavSelectContainer}>
                                <div className={styles.selectContainer}>
                                    <DynamicInputSelect
                                        options={daysSelectOptions()}
                                        value={selectedDate}
                                        isDisabled={isLoading}
                                        onChange={handleDayChange}
                                        isSearchable={false}
                                        placeholder="בחרו יום..."
                                        hasBorder={true}
                                        isBold={false}
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
                            <div style={{ width: "40px" }} />
                            <Logo />
                        </div>
                    </section>
                    <div className={styles.dateNav}>
                        <div className={styles.dateSelectContainer}>
                            <DynamicInputSelect
                                options={daysSelectOptions()}
                                value={selectedDate}
                                isDisabled={isLoading}
                                onChange={handleDayChange}
                                isSearchable={false}
                                placeholder="בחר יום..."
                                hasBorder={true}
                                isBold={false}
                                isCentered
                            />
                        </div>
                    </div>
                </header>
                <main
                    className={
                        styles.mainContent + (!isEditMode ? " " + styles.fullHeight : "")
                    }
                >
                    {children}
                </main>
            </div>
            <div className={styles.mobileActionBtns}>
                {isEditMode ? (
                    <MobileNavLayout>
                        <DailyActionBtns position="top" />
                    </MobileNavLayout>
                ) : null}
            </div>
            <HamburgerNav
                hamburgerType="private"
                isOpen={isMenuOpen}
                onClose={() => setIsMenuOpen(false)}
            />
        </>
    );
}
