"use client";

import React, { ChangeEvent, useMemo, useState } from "react";
import styles from "./HistoryPageLayout.module.css";
import Logo from "@/components/ui/Logo/Logo";
import HamburgerNav, { HamburgerButton } from "@/components/navigation/HamburgerNav/HamburgerNav";
import router from "@/routes";
import { useHistoryTable } from "@/context/HistoryTableContext";
import { useMobileSize } from "@/hooks/useMobileSize";

type HistoryPageLayoutProps = {
    children: React.ReactNode;
};

export default function HistoryPageLayout({ children }: HistoryPageLayoutProps) {
    const { selectedMonth, selectedDay, handleMonthChange, handleDayChange } = useHistoryTable();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const isMobile = useMobileSize();

    // Build YYYY-MM-DD for the <input type="date"> value
    const inputValue = useMemo(() => {
        const now = new Date();
        const year = now.getFullYear();
        const monthStr = String(selectedMonth ?? now.getMonth() + 1).padStart(2, "0");
        const dayStr = String(selectedDay ?? now.getDate()).padStart(2, "0");
        return `${year}-${monthStr}-${dayStr}`;
    }, [selectedMonth, selectedDay]);

    // Split the picked date and push month/day into the existing handlers
    const onDateChange = (e: ChangeEvent<HTMLInputElement>) => {
        const iso = e.target.value; // YYYY-MM-DD
        if (!iso) return;
        const [, m, d] = iso.split("-");
        handleMonthChange(String(Number(m))); // "09" -> "9"
        handleDayChange(String(Number(d))); // "02" -> "2"
    };

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
                            <div className={styles.rightContainer}>
                                <div>{router.annualSchedule.title}</div>
                                {!isMobile ? (
                                    <div className={styles.selectContainer}>
                                        {/* TODO: move to a new component */}
                                        <input
                                            id="history-date"
                                            name="history-date"
                                            type="date"
                                            className={styles.dateInput}
                                            value={inputValue}
                                            onChange={onDateChange}
                                        />
                                    </div>
                                ) : null}
                            </div>
                        </div>
                        <div className={styles.topNavLeft}>
                            <Logo size="S" />
                        </div>
                    </section>
                    {isMobile ? (
                        <div className={styles.bottomNav}>
                            {/* TODO: move to a new component */}
                            <input
                                id="history-date"
                                name="history-date"
                                type="date"
                                className={styles.dateInput}
                                value={inputValue}
                                onChange={onDateChange}
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
