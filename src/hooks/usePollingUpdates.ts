"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import router from "@/routes";
import { checkForUpdates, getChannelsForPath, SyncItem, SyncChannel } from "@/services/sync/clientSyncService";
import { POLL_INTERVAL_MS, ADMIN_BROADCAST_MESSAGE } from "@/models/constant/sync";
import { useSession } from "next-auth/react";
import { getStorageTeacher } from "@/lib/localStorage";
import { broadcastToast } from "@/lib/toast";

type UsePollingUpdatesReturn = {
    hasUpdate: boolean;
    resetUpdate: () => void;
    setLastTs: (ts: number) => void;
};

// Global set to ensure broadcast messages are shown exactly once per client session
const displayedBroadcasts = new Set<number>();

/**
 * Custom hook for polling server updates and managing update notifications
 * @returns Object containing hasUpdate state and resetUpdate function
 */

export const usePollingUpdates = (
    onRefreshRef?: { current: ((items: SyncItem[]) => Promise<void> | void) | null },
    channels?: SyncChannel[]
): UsePollingUpdatesReturn => {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const { data: session } = useSession();

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
        // Use provided channels or fallback to default logic, always ensuring ADMIN_BROADCAST_MESSAGE is polled
        const baseChannels: SyncChannel[] = channels || getChannelsForPath(pathname, router.teacherChanges.p);
        const channelsToPoll: SyncChannel[] = baseChannels.includes(ADMIN_BROADCAST_MESSAGE)
            ? baseChannels
            : [...baseChannels, ADMIN_BROADCAST_MESSAGE];

        const checkUpdates = async () => {
            const since = lastTsRef.current;
            const { hasUpdates, latestTs, items } = await checkForUpdates({ since, channels: channelsToPoll });

            if (mounted && hasUpdates) {
                // Check for live broadcast messages
                for (const item of items) {
                    if (item.channel === ADMIN_BROADCAST_MESSAGE && item.payload?.message && !displayedBroadcasts.has(item.ts)) {
                        displayedBroadcasts.add(item.ts);
                        const { targetSchoolId, targetAudience = "all", message, senderName } = item.payload;

                        const isPrivateScreen = Object.values(router).some(
                            (r) => r.private && r.p !== "/" && (pathname === r.p || pathname.startsWith(r.p + "/"))
                        );
                        const isTeacherScreen = !isPrivateScreen;

                        const matchesAudience =
                            targetAudience === "all" ||
                            (targetAudience === "managers" && isPrivateScreen) ||
                            (targetAudience === "teachers" && isTeacherScreen);

                        const currentSchoolId =
                            searchParams?.get("schoolId") ||
                            (session?.user as any)?.schoolId ||
                            getStorageTeacher()?.schoolId ||
                            pathname.split("/")[2];

                        const matchesSchool = !targetSchoolId || currentSchoolId === targetSchoolId;

                        if (matchesAudience && matchesSchool) {
                            broadcastToast(message, senderName);
                        }
                    }
                }

                // Only set general schedule hasUpdate for non-broadcast channels
                const nonBroadcastItems = items.filter(item => item.channel !== ADMIN_BROADCAST_MESSAGE);
                if (nonBroadcastItems.length > 0) {
                    setHasUpdate(true);
                }

                setLastTs(latestTs);

                // Trigger auto-refresh if callback provided
                if (onRefreshRef?.current && nonBroadcastItems.length > 0) {
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
