"use client";

import React from "react";
import { usePortalContext } from "@/context/PortalContext";
import { AUTO_SWITCH_TIME } from "@/utils/time";
import { usePollingUpdates } from "@/hooks/usePollingUpdates";
import { usePathname, useRouter } from "next/navigation";
import router from "@/routes";
import styles from "./PortalFullScreenLayout.module.css";
import Icons from "@/style/icons";

type PortalFullScreenLayoutProps = {
    children: React.ReactNode;
};

export default function PortalFullScreenLayout({ children }: PortalFullScreenLayoutProps) {
    const pathname = usePathname();
    const nav = useRouter(); // Renamed to avoid conflict if any, but 'router' import is the routes object
    const {
        teacher,
        handleRefreshDates,
        handlePublishedRefresh,
    } = usePortalContext();

    const refreshRef = React.useRef<(() => Promise<void>) | null>(null);
    const { resetUpdate } = usePollingUpdates(refreshRef);

    const handleRefresh = async () => {
        const res = await handleRefreshDates();

        // Use the FRESH options returned by handleRefreshDates
        const effectiveDate = res.selected;

        // Ensure we are in the correct route logic (similar to PortalPageLayout)
        if (
            pathname.includes(router.publishedPortal.p) ||
            pathname.includes(router.fullScheduleView.p)
        ) {
            // For published portal or full schedule view, always refresh with the effective date
            await handlePublishedRefresh(undefined, effectiveDate, undefined);
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
                target.setDate(target.getDate() + 1);
                delay = target.getTime() - now.getTime();
            }

            const timeoutId = setTimeout(() => {
                handleRefresh();
                checkAutoSwitch();
            }, delay);

            return () => clearTimeout(timeoutId);
        };

        const cleanup = checkAutoSwitch();
        return cleanup;
    }, [teacher]);

    // Render children directly without PageLayout or Header
    return (
        <div style={{
            width: "100%",
            height: "100dvh",
            overflow: "hidden",
            position: "relative"
        }}>
            <button
                className={styles.fab}
                onClick={() => nav.push(router.publishedPortal.p)}
                title="חזרה למערכת בית ספרית"
                aria-label="Exit Full Screen"
            >
                <Icons.close size={24} />
            </button>
            {children}
        </div>
    );
}
