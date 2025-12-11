"use client";

import React from "react";
import styles from "./PortalPageLayout.module.css";
import { usePortalContext } from "@/context/PortalContext";
import PortalNav from "@/components/navigation/PortalNav/PortalNav";
import { greetingTeacher } from "@/utils";
import { AUTO_SWITCH_TIME, getTodayDateString, getTomorrowDateString } from "@/utils/time";
import { usePollingUpdates } from "@/hooks/usePollingUpdates";
import { usePathname } from "next/navigation";
import router from "@/routes";
import { TeacherRoleValues } from "@/models/types/teachers";
import { useTeacherTableContext } from "@/context/TeacherTableContext";
import PageLayout from "../../PageLayout/PageLayout";

type PortalPageLayoutProps = {
    children: React.ReactNode;
};

export default function PortalPageLayout({ children }: PortalPageLayoutProps) {
    const pathname = usePathname();
    const {
        teacher,
        selectedDate,
        handleRefreshDates,
        handlePublishedRefresh,
        settings,
    } = usePortalContext();
    const { handlePortalRefresh } = useTeacherTableContext();
    const refreshRef = React.useRef<(() => Promise<void>) | null>(null);
    const { resetUpdate } = usePollingUpdates(refreshRef);
    const isRegularTeacher = teacher?.role === TeacherRoleValues.REGULAR;

    const handleRefresh = async () => {
        const res = await handleRefreshDates();

        // Use the FRESH options returned by handleRefreshDates
        const effectiveDate = res.selected || selectedDate;
        const freshOptions = res.options || [];
        const isValidDate = freshOptions.some(d => d.value === effectiveDate);

        if (pathname.includes(router.teacherPortal.p)) {
            if (isValidDate) await handlePortalRefresh(teacher, effectiveDate);
        } else if (pathname.includes(router.publishedPortal.p)) {
            if (isValidDate) await handlePublishedRefresh(undefined, effectiveDate, undefined);
        }
        // reset update badge after successful refresh
        resetUpdate();
    };

    // Keep the ref updated with the latest handleRefresh
    refreshRef.current = handleRefresh;

    // -- Auto Refresh at 16:00 -- //
    React.useEffect(() => {
        if (!teacher) return;

        const checkAutoSwitch = () => {
            const now = new Date();
            const [switchHour, switchMinute] = AUTO_SWITCH_TIME.split(":").map(Number);
            const target = new Date(now);
            target.setHours(switchHour, switchMinute, 0, 0);

            let delay = target.getTime() - now.getTime();

            if (delay < 0) {
                // The requirement: "When we enter the system a refresh timeout is set for next 4 PM (today or tomorrow)"
                // If it's already past 16:00, schedule for tomorrow 16:00
                target.setDate(target.getDate() + 1);
                delay = target.getTime() - now.getTime();
            }

            const timeoutId = setTimeout(() => {
                handleRefresh();
                // Re-schedule for next day (optional, if user keeps page open for > 24h)
                checkAutoSwitch();
            }, delay);

            return () => clearTimeout(timeoutId);
        };

        const cleanup = checkAutoSwitch();
        return cleanup;
    }, [teacher]);

    // -- Title Logic -- //
    const getTitle = () => {
        const today = getTodayDateString();
        const tomorrow = getTomorrowDateString();
        const isToday = selectedDate === today;
        const isTomorrow = selectedDate === tomorrow;

        let suffix = "";
        if (isToday) suffix = "להיום";
        else if (isTomorrow) suffix = "מחר";
        else {
            // Fallback: DD/MM
            const [y, m, d] = selectedDate.split("-");
            // selectedDate is YYYY-MM-DD
            if (d && m) suffix = `${d}/${m}`;
        }

        const isTeacherPortal = pathname.includes(router.teacherPortal.p);
        const baseTitle = isTeacherPortal ? "המערכת שלך" : "מערכת בית הספר";

        return (
            <div className={styles.titleContainer}>
                <div>{greetingTeacher(teacher)}</div>
                <div className={styles.subTitle}>{`${baseTitle} ${suffix}`}</div>
            </div>
        );
    };

    return (
        <PageLayout
            appType="public"
            hideLogo
            schoolSettings={settings}
            HeaderRightActions={
                <>
                    <h3 className={styles.greetingAndName}>{getTitle()}</h3>
                </>
            }
            HeaderLeftActions={
                !teacher ||
                    isRegularTeacher ||
                    (teacher?.role === TeacherRoleValues.SUBSTITUTE && settings?.displaySchedule2Susb) ? (
                    <div className={styles.navContainer}>
                        <PortalNav />
                    </div>
                ) : null
            }
            contentClassName=""
        >
            {children}
        </PageLayout>
    );
}
