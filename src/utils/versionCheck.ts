import { getSessionStorage, setSessionStorage, SESSION_KEYS } from "@/lib/sessionStorage";

// The version baked into this client bundle at build time.
// Set via next.config.ts env → CF_PAGES_COMMIT_SHA (Cloudflare Pages).
// Undefined in local dev – version checks are simply skipped.
const CLIENT_BUILD_ID = process.env.NEXT_PUBLIC_BUILD_ID ?? null;

/**
 * Checks if a reload for version update is already in progress.
 */
function isReloadingForVersion(): boolean {
    if (typeof window === "undefined") return false;
    const lastTimestamp = getSessionStorage<number>(SESSION_KEYS.RELOADING_VERSION_TIMESTAMP);
    if (!lastTimestamp) return false;
    const elapsed = Date.now() - Number(lastTimestamp);
    return elapsed < 15000; // 15 seconds window
}

/**
 * Compares the build ID baked into this client bundle against the server's
 * current build ID. If they differ, a new deployment has occurred – records
 * the reload state, schedules a page reload, and returns true.
 *
 * Returns false when: versions match, CLIENT_BUILD_ID is unavailable (local
 * dev), the network request fails, or a reload is already underway.
 */
export async function checkVersionAndReload(reloadDelayMs = 7000): Promise<boolean> {
    if (typeof window === "undefined") return false;
    if (isReloadingForVersion()) return true; // Already reloading

    // No build ID in local dev – skip the check entirely.
    if (!CLIENT_BUILD_ID) return false;

    try {
        const res = await fetch("/api/version", {
            cache: "no-store",
            headers: { "Cache-Control": "no-cache" },
        });
        if (!res.ok) return false;

        const data = await res.json();
        const serverVersion: string | undefined = data?.version;
        if (!serverVersion) return false;

        if (CLIENT_BUILD_ID !== serverVersion) {
            setSessionStorage(SESSION_KEYS.RELOADING_VERSION_TIMESTAMP, Date.now());
            setTimeout(() => {
                window.location.reload();
            }, reloadDelayMs);
            return true;
        }
        return false;
    } catch {
        return false;
    }
}
