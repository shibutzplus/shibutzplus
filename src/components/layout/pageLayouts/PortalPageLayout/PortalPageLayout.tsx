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
import { SyncItem } from "@/services/sync/clientSyncService";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import NotificationPermissionRequest from "@/components/common/NotificationPermissionRequest/NotificationPermissionRequest";
// import { usePopup } from "@/context/PopupContext";
// import NotificationRequestPopup from "@/components/popups/NotificationRequestPopup/NotificationRequestPopup";
import { successToast } from "@/lib/toast";

type PortalPageLayoutProps = {
    children: React.ReactNode;
};

export default function PortalPageLayout({ children }: PortalPageLayoutProps) {
    const pathname = usePathname();
    const { teacher, selectedDate, handleRefreshDates, refreshDailyScheduleTeacherPortal, settings, handleIncomingSync } = usePortalContext();
    const { refreshMaterialTeacherPortal, mainPortalTable } = useTeacherTableContext();
    const refreshRef = React.useRef<((items: SyncItem[]) => Promise<void> | void) | null>(null);
    const { resetUpdate } = usePollingUpdates(refreshRef);
    const isRegularTeacher = teacher?.role === TeacherRoleValues.REGULAR;
    const { registerAndSubscribe, permission, showIcon } = usePushNotifications();
    // const { openPopup } = usePopup();

    // Register for push notifications
    React.useEffect(() => {
        if (teacher?.schoolId) {
            registerAndSubscribe(teacher.schoolId, teacher.id, false);  // don't display question popup, register automatically
        }
    }, [teacher?.schoolId, teacher?.id]);

    const handleRefresh = async (items?: SyncItem[]) => {
        const { hasRelevantUpdate, newLists } = await handleIncomingSync(items);

        if (hasRelevantUpdate) {
            const res = await handleRefreshDates();
            const effectiveDate = res.selected;
            const freshOptions = res.options || [];
            const isValidDate = freshOptions.some(d => d.value === effectiveDate);

            if (pathname.includes(router.teacherMaterialPortal.p)) {
                if (isValidDate) await refreshMaterialTeacherPortal(teacher, effectiveDate);
            } else if (
                pathname.includes(router.scheduleViewPortal.p) ||
                pathname.includes(router.fullScheduleView.p)
            ) {
                await refreshDailyScheduleTeacherPortal(undefined, effectiveDate, undefined, true, newLists);
            }
        }
        resetUpdate();
    };

    refreshRef.current = handleRefresh; // Keep the ref updated with the latest handleRefresh

    // -- Auto Refresh at AUTO_SWITCH_TIME -- //
    React.useEffect(() => {
        if (!teacher) return;

        const checkAutoSwitch = () => {
            const now = new Date();
            const [switchHour, switchMinute] = AUTO_SWITCH_TIME.split(":").map(Number);
            const target = new Date(now);
            target.setHours(switchHour, switchMinute, 0, 0);

            let delay = target.getTime() - now.getTime();

            if (delay < 0) {
                // The requirement: "When we enter the system a refresh timeout is set for next AUTO_SWITCH_TIME (today or tomorrow)"
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
        const isToday = selectedDate === getTodayDateString();
        const isTomorrow = selectedDate === getTomorrowDateString();
        const [y, m, d] = selectedDate.split("-");
        const hasDate = Boolean(y && m && d);

        let when = "";
        if (isToday) when = "להיום";
        else if (isTomorrow) when = "למחר";
        else if (hasDate) {
            const isRegularPortal = pathname.includes(router.teacherMaterialPortal.p) && teacher?.role === TeacherRoleValues.REGULAR;
            when = isRegularPortal ? `ל${d}/${m}` : `${d}/${m}`;
        }

        const title = `מערכת ${when}`;

        return (
            <div className={styles.titleContainer}>
                <div>{greetingTeacher(teacher)}</div>
                <div className={styles.subTitle}>{title}</div>
            </div>
        );
    };

    return (
        <PageLayout
            appType="public"
            hideLogo
            schoolSettings={settings}
            teacher={teacher}
            HeaderRightActions={
                <div className={styles.headerRightContent}>
                    <h3 className={`${styles.greetingAndName} ${showIcon && permission === "default" && teacher?.schoolId ? styles.greetingWithNotification : ""}`}>
                        {getTitle()}
                    </h3>
                    {showIcon && permission === "default" && teacher?.schoolId && (
                        <NotificationPermissionRequest
                            onRequestPermission={() => {
                                // Direct request, bypassing the custom popup
                                successToast("כדי לקבל עדכוני מערכת בזמן אמת, לחצו על כפתור אישור/Allow בחלונית שנפתחה למעלה.", Infinity);
                                registerAndSubscribe(teacher.schoolId!, teacher.id, true);
                            }}
                        />
                    )}
                </div>
            }
            HeaderLeftActions={
                !teacher ||
                    isRegularTeacher ||
                    (teacher?.role === TeacherRoleValues.SUBSTITUTE && settings?.displaySchedule2Susb) ? (
                    pathname.includes(router.teacherMaterialPortal.p) &&
                        mainPortalTable[selectedDate] &&
                        Object.values(mainPortalTable[selectedDate]).some((row) => !row.isRegular) ? (
                        <div className={styles.navContainer}>
                            <PortalNav />
                        </div>
                    ) : null
                ) : null
            }
            contentClassName=""
        >
            {children}
        </PageLayout>
    );
}
