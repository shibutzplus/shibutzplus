"use client";

import React, { useState } from "react";
import styles from "./PortalPageLayout.module.css";
import Logo from "@/components/ui/Logo/Logo";
import HamburgerNav, { HamburgerButton } from "@/components/navigation/HamburgerNav/HamburgerNav";
import { useMobileSize } from "@/hooks/useMobileSize";
import DynamicInputSelect from "@/components/ui/select/InputSelect/DynamicInputSelect";
import { usePortal } from "@/context/PortalContext";
import PortalNav from "@/components/navigation/PortalNav/PortalNav";
import { greetingTeacher } from "@/utils";
import IconBtn from "@/components/ui/buttons/IconBtn/IconBtn";
import Icons from "@/style/icons";
import { usePollingUpdates } from "@/hooks/usePollingUpdates";
import { errorToast } from "@/lib/toast";
import { usePathname } from "next/navigation";
import router from "@/routes";
import MobileNavLayout from "../../MobileNavLayout/MobileNavLayout";
import { TeacherRoleValues } from "@/models/types/teachers";

type PortalPageLayoutProps = {
    children: React.ReactNode;
};

export default function PortalPageLayout({ children }: PortalPageLayoutProps) {
    const pathname = usePathname();
    const {
        teacher,
        selectedDate,
        isPortalLoading,
        publishDatesOptions,
        handleDayChange,
        fetchPortalScheduleDate,
        fetchPublishScheduleData,
        refreshPublishDates,
    } = usePortal();
    const { hasUpdate, resetUpdate } = usePollingUpdates();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const isMobile = useMobileSize();

    const isRegularTeacher = teacher?.role === TeacherRoleValues.REGULAR;

    const handleRefresh = async () => {
        const datesRes = await refreshPublishDates();

        let response;
        if (pathname.includes(router.teacherPortal.p)) {
            response = await fetchPortalScheduleDate();
        } else {
            response = await fetchPublishScheduleData();
        }
        if (
            (!response.success && response.error !== "") ||
            (!datesRes.success && datesRes.error !== "")
        ) {
            errorToast("בעיה בטעינת המידע, נסו שוב");
            return;
        }
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
                            {!isMobile ? (
                                <div className={styles.selectContainer}>
                                    <DynamicInputSelect
                                        options={publishDatesOptions}
                                        value={selectedDate}
                                        isDisabled={isPortalLoading}
                                        onChange={handleDayChange}
                                        isSearchable={false}
                                        placeholder="בחר יום..."
                                        hasBorder
                                    />
                                </div>
                            ) : null}
                            <div
                                className={`${styles.refreshContainer} ${hasUpdate ? styles.refreshAlert : ""}`}
                            >
                                <IconBtn
                                    Icon={<Icons.refresh size={26} />}
                                    onClick={handleRefresh}
                                    disabled={isPortalLoading}
                                    isLoading={isPortalLoading}
                                />
                            </div>
                        </div>
                        <div className={styles.topNavLeft}>
                            {!isMobile && isRegularTeacher ? (
                                <div>
                                    <PortalNav />
                                </div>
                            ) : null}
                            <Logo size="S" />
                        </div>
                    </section>
                    {isMobile ? (
                        <div className={styles.bottomNav}>
                            <DynamicInputSelect
                                options={publishDatesOptions}
                                value={selectedDate}
                                isDisabled={isPortalLoading}
                                onChange={handleDayChange}
                                isSearchable={false}
                                placeholder="בחר יום..."
                                hasBorder
                            />
                        </div>
                    ) : null}
                </header>
                <main className={styles.mainContent}>{children}</main>
            </div>
            {isMobile && isRegularTeacher ? (
                <MobileNavLayout>
                    <PortalNav />
                </MobileNavLayout>
            ) : null}
            <HamburgerNav
                hamburgerType="public"
                isOpen={isMenuOpen}
                onClose={() => setIsMenuOpen(false)}
            />
        </>
    );
}
