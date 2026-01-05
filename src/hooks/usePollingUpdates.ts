"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import router from "@/routes";
import { checkForUpdates, getChannelsForPath } from "@/services/syncService";

const POLL_INTERVAL_MS = 30000; // 30 seconds

type UsePollingUpdatesReturn = {
    hasUpdate: boolean;
    resetUpdate: () => void;
};

/**
 * Custom hook for polling server updates and managing update notifications
 * @returns Object containing hasUpdate state and resetUpdate function
 */
export const usePollingUpdates = (
    onRefreshRef?: { current: (() => Promise<void> | void) | null }
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

        // on teacher screen, listen to teacher columns events only
        // on schedule screen, listen to both teacher and events columns changes
        const channels = getChannelsForPath(pathname, router.teacherMaterialPortal.p);

        const checkUpdates = async () => {
            const since = lastTsRef.current;
            const { hasUpdates, latestTs } = await checkForUpdates({ since, channels });

            if (mounted && hasUpdates) {
                //successToast("המערכת היומית עודכנה...", 3000);
                setHasUpdate(true);
                setLastTs(latestTs);

                // Trigger auto-refresh if callback provided
                if (onRefreshRef?.current) {
                    onRefreshRef.current();
                }
            }
        };

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
    }, [pathname, onRefreshRef]);

    // Reset polling state on path change as we already get new data from DB
    useEffect(() => {
        setHasUpdate(false);
        setLastTs(Date.now());
    }, [pathname]);

    const resetUpdate = () => {
        setHasUpdate(false);
        setLastTs(Date.now());
    };

    return {
        hasUpdate,
        resetUpdate,
    };
};
