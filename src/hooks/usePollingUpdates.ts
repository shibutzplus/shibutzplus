"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import router from "@/routes";
import { checkForUpdates, getChannelsForPath, SyncItem, SyncChannel } from "@/services/sync/clientSyncService";
import { POLL_INTERVAL_MS } from "@/models/constant/sync";

type UsePollingUpdatesReturn = {
    hasUpdate: boolean;
    resetUpdate: () => void;
    setLastTs: (ts: number) => void;
};

/**
 * Custom hook for polling server updates and managing update notifications
 * @returns Object containing hasUpdate state and resetUpdate function
 */

export const usePollingUpdates = (
    onRefreshRef?: { current: ((items: SyncItem[]) => Promise<void> | void) | null },
    channels?: SyncChannel[]
): UsePollingUpdatesReturn => {
    const pathname = usePathname();

    // Alert state for incoming updates
    const [hasUpdate, setHasUpdate] = useState(false);
    const [lastTs, setLastTs] = useState<number>(() => Date.now());
    const lastTsRef = useRef<number>(lastTs);

    useEffect(() => {
        lastTsRef.current = lastTs;
    }, [lastTs]);

    // Poll changes from daily schedule screen 
    useEffect(() => {
        let mounted = true;
        let id: ReturnType<typeof setInterval> | null = null;

        const NO_POLLING_ROUTES = [
            router.history.p,
            router.statistics.p,
            router.faqManager.p,
            router.faqTeachers.p,
        ];

        if (NO_POLLING_ROUTES.some(route => pathname.startsWith(route))) {
            return;
        }

        // on teacher screen, listen to teacher columns events only
        // on schedule screen, listen to both teacher and events columns changes
        // Use provided channels or fallback to default logic
        const channelsToPoll = channels || getChannelsForPath(pathname, router.teacherMaterialPortal.p);

        const checkUpdates = async () => {
            const since = lastTsRef.current;
            const { hasUpdates, latestTs, items } = await checkForUpdates({ since, channels: channelsToPoll });

            if (mounted && hasUpdates) {
                setHasUpdate(true);
                setLastTs(latestTs);

                // Trigger auto-refresh if callback provided
                if (onRefreshRef?.current) {
                    onRefreshRef.current(items);
                }
            }
        };

        // Initial check immediately on mount/path change
        checkUpdates();

        id = setInterval(checkUpdates, POLL_INTERVAL_MS);

        // Pause polling when tab/browser is not visible
        const handleVisibility = () => {
            if (document.hidden) {
                if (id) clearInterval(id);
            } else {
                checkUpdates();
                id = setInterval(checkUpdates, POLL_INTERVAL_MS);
            }
        };
        document.addEventListener("visibilitychange", handleVisibility);

        return () => {
            mounted = false;
            if (id) clearInterval(id);
            document.removeEventListener("visibilitychange", handleVisibility);
        };
    }, [pathname, onRefreshRef, channels]);

    // Reset polling state on path change as we already get new data from DB
    useEffect(() => {
        setHasUpdate(false);
    }, [pathname]);

    const resetUpdate = () => {
        setHasUpdate(false);
        setLastTs(Date.now());
    };

    return {
        hasUpdate,
        resetUpdate,
        setLastTs,
    };
};
