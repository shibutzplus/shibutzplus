"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { successToast } from "@/lib/toast";
import router from "@/routes";

const POLL_INTERVAL_MS = 30000; // 30 seconds

type UsePollingUpdatesReturn = {
    hasUpdate: boolean;
    resetUpdate: () => void;
};

/**
 * Custom hook for polling server updates and managing update notifications
 * @returns Object containing hasUpdate state and resetUpdate function
 */
export const usePollingUpdates = (): UsePollingUpdatesReturn => {
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
        const channels = pathname.includes(router.teacherPortal.p) ? "teacher" : "teacher,event";

        const checkUpdates = async () => {
            try {
                const since = lastTsRef.current;
                const res = await fetch(`/api/sync/poll?since=${since}&channels=${encodeURIComponent(channels)}`, { cache: "no-store" });
                if (!res.ok) return;
                const data = await res.json();
                const latest = Number(data?.latestTs || 0);
                if (mounted && latest > since) {
                    successToast("נמצאו עדכונים חדשים, יש ללחוץ על רענון כדי לראותם");
                    setHasUpdate(true);
                    setLastTs(latest);
                }
            } catch { 
                // Silently handle fetch errors
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
    }, [pathname]);

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
