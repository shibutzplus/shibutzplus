"use client";

import React, { useState } from "react";
import styles from "./PortalPageLayout.module.css";
import Logo from "@/components/ui/Logo/Logo";
import HamburgerNav, { HamburgerButton } from "@/components/navigation/HamburgerNav/HamburgerNav";
import { useMobileSize } from "@/hooks/browser/useMobileSize";
import DynamicInputSelect from "@/components/ui/select/InputSelect/DynamicInputSelect";
import { usePortalContext } from "@/context/PortalContext";
import PortalNav from "@/components/navigation/PortalNav/PortalNav";
import { greetingTeacher } from "@/utils";
import IconBtn from "@/components/ui/buttons/IconBtn/IconBtn";
import Icons from "@/style/icons";
import { usePollingUpdates } from "@/hooks/usePollingUpdates";
import { usePathname } from "next/navigation";
import router from "@/routes";
import MobileNavLayout from "../../MobileNavLayout/MobileNavLayout";
import { TeacherRoleValues } from "@/models/types/teachers";
import { useTeacherTableContext } from "@/context/TeacherTableContext";

type PortalPageLayoutProps = {
    children: React.ReactNode;
};

export default function PortalPageLayout({ children }: PortalPageLayoutProps) {
    const pathname = usePathname();
    const {
        teacher,
        datesOptions,
        selectedDate,
        isDatesLoading,
        handleDayChange,
        handleRefreshDates,
        handlePublishedRefresh,
        isPublishLoading,
    } = usePortalContext();
    const { isPortalLoading, handlePortalRefresh } = useTeacherTableContext();
    const { hasUpdate, resetUpdate } = usePollingUpdates();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const isRegularTeacher = teacher?.role === TeacherRoleValues.REGULAR;

    const isLoading = pathname.includes(router.teacherPortal.p)
        ? isPortalLoading || isDatesLoading
        : isPublishLoading || isDatesLoading;

    const handleRefresh = async () => {
        await handleRefreshDates();

        if (pathname.includes(router.teacherPortal.p)) await handlePortalRefresh(teacher);
        else await handlePublishedRefresh();

        // reset update badge after successful refresh
        resetUpdate();
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
                            <h3 className={styles.greeting}>{greetingTeacher(teacher)}</h3>
                            <div className={styles.topSelectContainer}>
                                <DynamicInputSelect
                                    options={datesOptions}
                                    value={selectedDate}
                                    isDisabled={isLoading}
                                    onChange={handleDayChange}
                                    isSearchable={false}
                                    placeholder="בחר יום..."
                                    hasBorder
                                />
                            </div>
                            <div
                                className={`${styles.refreshContainer} ${hasUpdate ? styles.refreshAlert : ""}`}
                            >
                                <IconBtn
                                    Icon={<Icons.refresh size={26} />}
                                    onClick={handleRefresh}
                                    disabled={isLoading}
                                    isLoading={isLoading}
                                />
                            </div>
                        </div>
                        <div className={styles.topNavLeft}>
                            {isRegularTeacher ? (
                                <div>
                                    <PortalNav />
                                </div>
                            ) : null}
                            <div className={styles.logoContainer}>
                                <Logo size="S" />
                            </div>
                        </div>
                    </section>
                    <div className={styles.bottomNav}>
                        <div className={styles.bottomSelectContainer}>
                            <DynamicInputSelect
                                options={datesOptions}
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
            <HamburgerNav
                hamburgerType="public"
                isOpen={isMenuOpen}
                onClose={() => setIsMenuOpen(false)}
            />
        </>
    );
}
